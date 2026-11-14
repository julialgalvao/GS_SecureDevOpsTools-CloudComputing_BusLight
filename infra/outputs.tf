output "url_mvp" {
  description = "Endereço público do BusLight"
  value       = "http://${aws_eip.app.public_ip}"
}

output "ip_publico" {
  value = aws_eip.app.public_ip
}

output "id_instancia" {
  description = "Vai no GitHub Secret EC2_INSTANCE_ID"
  value       = aws_instance.app.id
}
