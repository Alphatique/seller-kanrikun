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

resource "vercel_project" "seller-kanrikun" {
  name      = "seller-kanrikun"
  team_id   = "alphatique"
  framework = "nextjs"
  git_repository = {
    type              = "github"
    repo              = "Alphatique/seller-kanrikun"
    production_branch = "main"
  }
  root_directory = "web"
  build_command  = "bun run build"
  environment = [{
    key    = "DOTENV_PRIVATE_KEY"
    target = ["production", "preview"]
    value  = var.DOTENV_PRIVATE_KEY
  }]
}
