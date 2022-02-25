# def get_request_parameter(request, *args):
#   parameters = {}

#   for arg in args:
#     if request.method == 'POST':
#       parameters[arg] = request.form[arg]
#     elif request.method == 'GET':
#         return request.args.get(arg)


def table_exists(db, table):
    return db.inspect(db.engine).has_table(table)
