# CLI
```bash
docker-compose run --rm web python ./api/manage.py reset_db
```

# Run project locally
This project is Dockerized, but some package will be required on host to provide goog coding experience.

Install pip & pipx:
```bash
cd Cavity-backend
sudo apt install pip
sudo apt install python3.8-venv
python3 -m pip install --user pipx
python3 -m pipx ensurepath
```

Open new terminal or source your .bashrc, then:

```bash
pipx install pipenv
pipenv install black isort flake8 --dev
```

Configure your vs code to format files on save with black formatter OR use your format command.

Then, install your local depedencies:
```bash
python3 -m venv venv
. venv/bin/activate
```


Finally, run the project with:
```bash
docker-compose up
```

The first time, an error might occure since you need to pull images, just ```docker-compose up``` again.

# Interact programatically
```bash
curl -d '{"email":"user@bruh.com", "password":"passwd"}' -H "Content-Type: application/json" -X POST http://172.25.0.3:5000/auth/login
```

# Add depedencies
```bash
. venv/bin/activate
pip install [package]
pip freeze > requirements.txt
```

# Init the mail client
Use the `init_mail_client` CLI command with the argument password to register the cavity mail account to Yagmail.

```bash
docker-compose run --rm web python ./api/manage.py init_mail_client [password]
```
