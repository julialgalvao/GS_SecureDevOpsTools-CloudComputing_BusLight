variable "regiao" {
  description = "Região da AWS (us-east-1 funciona em conta pessoal e no AWS Academy Learner Lab)"
  type        = string
  default     = "us-east-1"
}

variable "tipo_instancia" {
  description = "Tipo da EC2"
  type        = string
  default     = "t3.micro"
}

variable "perfil_instancia" {
  description = "Instance profile já existente. Deixe vazio para o Terraform criar a role do SSM (conta pessoal). No AWS Academy Learner Lab use LabInstanceProfile, porque lá não dá para criar IAM Role."
  type        = string
  default     = ""
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
