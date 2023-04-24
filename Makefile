FRONTEND_DIR = fact-fortress-frontend
FRONTEND_URL = http://localhost:8080

.PHONY: install run

install:
	node_version=`node -v`; \
	if ! echo $$node_version | grep -qE '^v18\.'; then \
		command -v nvm >/dev/null 2>&1 || \
			curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash && \
			. ~/.nvm/nvm.sh && \
			nvm install 18; \
		. ~/.nvm/nvm.sh && \
		nvm use 18; \
	fi
	command -v pnpm >/dev/null 2>&1 || { \
		curl -fsSL https://get.pnpm.io/v6.21.js | node - add --global pnpm \
	}

run:
	lsof -ti :3000 | xargs kill -9 || true # kill previous instance of the backend
	lsof -ti :8545 | xargs kill -9 || true # kill previous instance of Ganache
	lsof -ti :8080 | xargs kill -9 || true # kill previous instance of the frontend
	pnpm install
	pnpm backend &
	echo "Waiting for the backend to be up and running..."
	sleep 30
	if [ ! -d "fact-fortress-frontend" ]; then \
		git clone git@github.com:pierg/fact-fortress-frontend.git; \
	fi
	cd $(FRONTEND_DIR) && pnpm install
	pnpm frontend &
	echo "Waiting for the frontend to be up and running..."
	sleep 10
	@if command -v open >/dev/null 2>&1; then \
		open $(FRONTEND_URL); \
	elif command -v xdg-open >/dev/null 2>&1; then \
		xdg-open $(FRONTEND_URL); \
	fi

update:
	git pull && pnpm install
	cd $(FRONTEND_DIR) && git pull && pnpm install
	make run
