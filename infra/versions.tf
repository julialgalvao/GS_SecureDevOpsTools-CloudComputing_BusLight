terraform {
  required_version = ">= 1.6"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.regiao

  default_tags {
    tags = {
      Projeto    = "BusLight"
      Disciplina = "Secure DevOps Tools & Cloud Computing"
      GS         = "2026.2"
    }
  }
}
