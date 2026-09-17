.PHONY: build up down logs shell install restart

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

shell:
	docker compose exec frontend sh

install:
	docker compose exec frontend npm install

restart:
	docker compose restart


help:
	@echo "Comandos disponíveis:"
	@echo "  make build   - Constroi a imagem"
	@echo "  make up      - Sobe o container"
	@echo "  make down    - Para o container"
	@echo "  make restart - Reinicia o container"
	@echo "  make logs    - Mostra os logs"
	@echo "  make shell   - Entra no container"
	@echo "  make install - Instala dependencias"
