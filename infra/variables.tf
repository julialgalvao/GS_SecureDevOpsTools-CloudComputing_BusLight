variable "regiao" {
  description = "Região da AWS (o AWS Academy Learner Lab usa us-east-1)"
  type        = string
  default     = "us-east-1"
}

variable "tipo_instancia" {
  description = "Tipo da EC2"
  type        = string
  default     = "t3.micro"
}

variable "perfil_instancia" {
  description = "Instance profile da EC2. No Learner Lab não dá para criar IAM Role, então usamos o LabInstanceProfile que já existe."
  type        = string
  default     = "LabInstanceProfile"
}

variable "cidr_http" {
  description = "Quem pode acessar o site na porta 80 (público, é o MVP do cidadão)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "repositorio" {
  description = "Repositório clonado na EC2 (docker-compose.yml e config do nginx)"
  type        = string
  default     = "https://github.com/julialgalvao/GS_SecureDevOpsTools-CloudComputing_BusLight.git"
}

variable "imagem" {
  description = "Imagem do app publicada pelo pipeline no GHCR"
  type        = string
  default     = "ghcr.io/julialgalvao/gs_securedevopstools-cloudcomputing_buslight:latest"
}
