output "url_mvp" {
  description = "Endereço público do BusLight (vai na variável MVP_URL do GitHub)"
  value       = "http://${azurerm_public_ip.app.fqdn}"
}

output "ip_publico" {
  value = azurerm_public_ip.app.ip_address
}

output "nome_vm" {
  value = azurerm_linux_virtual_machine.app.name
}
