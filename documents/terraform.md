1. Write terraform.tfvars file
```sample.tfvars
DOTENV_PRIVATE_KEY = ""
BASELIME_KEY       = ""
CRON_SECRET        = ""
VERCEL_API_TOKEN   = ""
```
Get Vercel api token
https://vercel.com/account/settings/tokens

2. Terraform plan & apply
```
terraform plan
terraform apply
```

3. (If it doesn't work, try terraform import exist resources)
```
terraform import vercel_project.seller-kanrikun seller-kanrikun
terraform import vercel_project_domain.seller-kanrikun seller-kanrikun
```
