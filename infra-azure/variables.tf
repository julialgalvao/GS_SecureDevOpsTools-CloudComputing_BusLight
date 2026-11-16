variable "subscription_id" {
  description = "ID da assinatura Azure for Students (Subscriptions no portal). Vem do terraform.tfvars, fora do Git."
  type        = string
}

variable "regiao" {
  description = "Região do Azure (a política da assinatura de estudante só permite eastus2, canadacentral, northcentralus, centralus e southcentralus)"
  type        = string
  default     = "northcentralus"
}

variable "tamanho_vm" {
  description = "Tamanho da VM"
  type        = string
  default     = "Standard_B2ats_v2"
}

variable "sku_so" {
  description = "Imagem do Ubuntu: server-arm64 para tamanhos ARM (terminam em p, como Standard_B2pts_v2) ou server para x86"
  type        = string
  default     = "server"
}

variable "dns_label" {
  description = "Prefixo do endereço público (<prefixo>.<regiao>.cloudapp.azure.com). Precisa ser único na região."
  type        = string
  default     = "buslight-gs"
}

variable "cidr_http" {
  description = "Quem pode acessar o site na porta 80 (público, é o MVP do cidadão)"
  type        = string
  default     = "*"
}

variable "repositorio" {
  description = "Repositório clonado na VM (docker-compose.yml e config do nginx)"
  type        = string
  default     = "https://github.com/julialgalvao/GS_SecureDevOpsTools-CloudComputing_BusLight.git"
}

variable "imagem" {
  description = "Imagem do app publicada pelo pipeline no GHCR"
  type        = string
  default     = "ghcr.io/julialgalvao/gs_securedevopstools-cloudcomputing_buslight:latest"
}

variable "metrics_token" {
  description = "Token que o Prometheus usa em /metrics. Vem do terraform.tfvars (fora do Git). Vazio: a VM gera um aleatório."
  type        = string
  default     = ""
  sensitive   = true
}
