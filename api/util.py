# def get_request_parameter(request, *args):
#   parameters = {}

#   for arg in args:
#     if request.method == 'POST':
#       parameters[arg] = request.form[arg]
#     elif request.method == 'GET':
#         return request.args.get(arg)


import random, yagmail


def table_exists(db, table):
    return db.inspect(db.engine).has_table(table)


def generate_account_confirmation_code():
    code = ""

    for _ in range(6):
        number = random.randint(0, 9)
        code += str(number)

    return code


def send_confirmation_mail(user):
    with open("./api/pw.txt") as f:
        content = f.readlines()[0]

        yag = yagmail.SMTP("cavity.app@gmail.com", content)
        content = (
            "Votre code de confirmation est "
            + user.registration_code[0:3]
            + " "
            + user.registration_code[3:6]
            + "."
        )

        yag.send(
            to=user.email,
            subject="Confirmation de création de compte",
            contents=content,
        )
