# def get_request_parameter(request, *args):
#   parameters = {}

#   for arg in args:
#     if request.method == 'POST':
#       parameters[arg] = request.form[arg]
#     elif request.method == 'GET':
#         return request.args.get(arg)


import random


def table_exists(db, table):
    return db.inspect(db.engine).has_table(table)


def generate_account_confirmation_code():
    code = ""

    for _ in range(6):
        number = random.randint(0, 9)
        code += str(number)

    return code