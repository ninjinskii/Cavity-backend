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

Finally, run the project with:
```bash
docker-compose up
```

The first time, an error might occure since you need to pull images, just ```docker-compose up``` again.