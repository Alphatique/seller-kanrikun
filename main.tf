terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

variable "DOTENV_PRIVATE_KEY" {
  type = string
}

variable "BASELIME_KEY" {
  type = string
}

variable "CRON_SECRET" {
  type = string
}

variable "VERCEL_API_TOKEN" {
  type = string
}

provider "vercel" {
  api_token = var.VERCEL_API_TOKEN
}

resource "vercel_project" "seller-kanrikun" {
  name      = "seller-kanrikun"
  framework = "nextjs"
  git_repository = {
    type              = "github"
    repo              = "Alphatique/seller-kanrikun"
    production_branch = "main"
  }
  root_directory             = "web"
  build_command              = "bun run build"
  serverless_function_region = "hnd1"
  environment = [{
    key    = "DOTENV_PRIVATE_KEY"
    target = ["production", "preview"]
    value  = var.DOTENV_PRIVATE_KEY
    }, {
    key    = "SELLER_KANRIKUN_BASE_URL"
    target = ["production"]
    value  = "https://seller-kanrikun.alphatique.co.jp"
    },{
    key    = "R2_BUCKET_NAME"
    target = ["production"]
    value  = "seller-kanrikun"
    }, {
    key    = "BASELIME_KEY"
    target = ["production"]
    value  = var.BASELIME_KEY
    }, {
    key    = "CRON_SECRET"
    target = ["production", "preview"]
    value  = var.CRON_SECRET
  }]
}

resource "vercel_project_domain" "seller_kanrikun_domain" {
  project_id = vercel_project.seller-kanrikun.id
  domain     = "seller-kanrikun.alphatique.co.jp"
}