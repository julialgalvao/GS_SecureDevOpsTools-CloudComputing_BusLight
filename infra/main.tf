# BusLight - infraestrutura na AWS
# Rede própria, uma EC2 com Docker e um Elastic IP para a URL do MVP não mudar.
# Não existe porta de administração aberta: o acesso à máquina é pelo SSM Session Manager.

data "aws_availability_zones" "disponiveis" {
  state = "available"
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

# ------------------------------------------------------------------ rede
resource "aws_vpc" "buslight" {
  cidr_block           = "10.20.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = { Name = "buslight-vpc" }
}

resource "aws_internet_gateway" "buslight" {
  vpc_id = aws_vpc.buslight.id
  tags   = { Name = "buslight-igw" }
}

resource "aws_subnet" "publica" {
  vpc_id            = aws_vpc.buslight.id
  cidr_block        = "10.20.1.0/24"
  availability_zone = data.aws_availability_zones.disponiveis.names[0]

  tags = { Name = "buslight-subnet-publica" }
}

resource "aws_route_table" "publica" {
  vpc_id = aws_vpc.buslight.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.buslight.id
  }

  tags = { Name = "buslight-rt-publica" }
}

resource "aws_route_table_association" "publica" {
  subnet_id      = aws_subnet.publica.id
  route_table_id = aws_route_table.publica.id
}

# ------------------------------------------------------------------ firewall
resource "aws_security_group" "web" {
  name        = "buslight-web"
  description = "BusLight: entrada so na porta 80, sem SSH"
  vpc_id      = aws_vpc.buslight.id

  ingress {
    description = "Site do MVP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.cidr_http]
  }

  egress {
    description = "Saida para baixar pacotes, imagem do GHCR e chamar a API da SPTrans"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "buslight-web" }
}

# ------------------------------------------------------------------ acesso da instância (SSM)
# Conta pessoal: o Terraform cria a role que permite o acesso pelo SSM (sem SSH).
# AWS Academy (Learner Lab): não dá para criar role; use perfil_instancia = "LabInstanceProfile".
resource "aws_iam_role" "ssm" {
  count = var.perfil_instancia == "" ? 1 : 0
  name  = "buslight-ssm"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ssm" {
  count      = var.perfil_instancia == "" ? 1 : 0
  role       = aws_iam_role.ssm[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ssm" {
  count = var.perfil_instancia == "" ? 1 : 0
  name  = "buslight-ssm"
  role  = aws_iam_role.ssm[0].name
}

locals {
  perfil_instancia = var.perfil_instancia != "" ? var.perfil_instancia : one(aws_iam_instance_profile.ssm[*].name)
}

# ------------------------------------------------------------------ servidor
resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.tipo_instancia
  subnet_id              = aws_subnet.publica.id
  vpc_security_group_ids = [aws_security_group.web.id]
  iam_instance_profile   = local.perfil_instancia

  user_data = templatefile("${path.module}/user_data.sh.tftpl", {
    repositorio = var.repositorio
    imagem      = var.imagem
  })
  user_data_replace_on_change = true

  # IMDSv2 obrigatório (protege as credenciais da instância)
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  tags = { Name = "buslight-app" }
}

resource "aws_eip" "app" {
  domain   = "vpc"
  instance = aws_instance.app.id

  tags = { Name = "buslight-eip" }

  depends_on = [aws_internet_gateway.buslight]
}
