# BusLight - infraestrutura no Azure (Azure for Students)
# Rede própria, uma VM Linux com Docker e IP público estático para a URL do MVP não mudar.
# Não existe porta de administração aberta: só a 80 entra, e a VM atualiza o app sozinha (pull).

resource "azurerm_resource_group" "buslight" {
  name     = "rg-buslight"
  location = var.regiao

  tags = {
    Projeto    = "BusLight"
    Disciplina = "Secure DevOps Tools & Cloud Computing"
    GS         = "2026.2"
  }
}

# ------------------------------------------------------------------ rede
resource "azurerm_virtual_network" "buslight" {
  name                = "vnet-buslight"
  address_space       = ["10.20.0.0/16"]
  location            = azurerm_resource_group.buslight.location
  resource_group_name = azurerm_resource_group.buslight.name
}

resource "azurerm_subnet" "publica" {
  name                 = "snet-publica"
  resource_group_name  = azurerm_resource_group.buslight.name
  virtual_network_name = azurerm_virtual_network.buslight.name
  address_prefixes     = ["10.20.1.0/24"]
}

# ------------------------------------------------------------------ firewall
# Entrada só na porta 80. Todo o resto cai na regra padrão DenyAllInbound do Azure.
resource "azurerm_network_security_group" "web" {
  name                = "nsg-buslight-web"
  location            = azurerm_resource_group.buslight.location
  resource_group_name = azurerm_resource_group.buslight.name

  security_rule {
    name                       = "site-http"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "80"
    source_address_prefix      = var.cidr_http
    destination_address_prefix = "*"
    description                = "Site do MVP"
  }

  security_rule {
    name                       = "bloqueia-o-resto"
    priority                   = 4000
    direction                  = "Inbound"
    access                     = "Deny"
    protocol                   = "*"
    source_port_range          = "*"
    destination_port_range     = "*"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
    description                = "Sem SSH nem outra porta administrativa"
  }
}

resource "azurerm_subnet_network_security_group_association" "publica" {
  subnet_id                 = azurerm_subnet.publica.id
  network_security_group_id = azurerm_network_security_group.web.id
}

# ------------------------------------------------------------------ endereço público
resource "azurerm_public_ip" "app" {
  name                = "pip-buslight"
  location            = azurerm_resource_group.buslight.location
  resource_group_name = azurerm_resource_group.buslight.name
  allocation_method   = "Static"
  sku                 = "Standard"
  domain_name_label   = var.dns_label
}

resource "azurerm_network_interface" "app" {
  name                = "nic-buslight"
  location            = azurerm_resource_group.buslight.location
  resource_group_name = azurerm_resource_group.buslight.name

  ip_configuration {
    name                          = "interna"
    subnet_id                     = azurerm_subnet.publica.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.app.id
  }
}

# ------------------------------------------------------------------ servidor
# O Azure exige uma chave SSH na criação da VM. A chave privada nunca sai do Terraform
# e a porta 22 está fechada, então ninguém entra por SSH.
resource "tls_private_key" "vm" {
  algorithm = "ED25519"
}

resource "azurerm_linux_virtual_machine" "app" {
  name                = "vm-buslight"
  location            = azurerm_resource_group.buslight.location
  resource_group_name = azurerm_resource_group.buslight.name
  size                = var.tamanho_vm
  admin_username      = "buslight"

  network_interface_ids = [azurerm_network_interface.app.id]

  disable_password_authentication = true
  admin_ssh_key {
    username   = "buslight"
    public_key = tls_private_key.vm.public_key_openssh
  }

  os_disk {
    caching              = "ReadWrite"
    storage_account_type = "StandardSSD_LRS"
    disk_size_gb         = 30
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "ubuntu-24_04-lts"
    sku       = var.sku_so
    version   = "latest"
  }

  custom_data = base64encode(templatefile("${path.module}/user_data.sh.tftpl", {
    repositorio = var.repositorio
    imagem      = var.imagem
    metrics     = var.metrics_token
    sptrans     = var.sptrans_token
  }))
}
