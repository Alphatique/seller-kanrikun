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

resource "vercel_project" "seller-kanrikun" {
  name      = "seller-kanrikun"
  team_id   = "alphatique"
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

resource "vercel_project_domain" "seller-kanrikun" {
  project_id = vercel_project.seller-kanrikun.id
  domain     = "seller-kanrikun.alphatique.co.jp"
}