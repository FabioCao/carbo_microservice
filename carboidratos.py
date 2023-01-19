from datetime import datetime
from flask import jsonify, make_response, abort

from pymongo import MongoClient

#client = MongoClient("mongodb://localhost:27017/") # Local
client = MongoClient("mongodb://mongo:27017")
db = client.carboidratos

def get_dict_from_mongodb():
    itens_db = db.carboidratos.find()
    CARBO = {}
    for i in itens_db:
            i.pop('_id') # retira id: criado automaticamente docker 
            item = dict(i)
            CARBO[item["alimento"]] = (i)
    return CARBO

def get_timestamp():
    return datetime.now().strftime(("%Y-%m-%d %H:%M:%S"))

def read_all():
    CARBO = get_dict_from_mongodb()
    dict_carboidratos = [CARBO[key] for key in sorted(CARBO.keys())]
    carboidratos = jsonify(dict_carboidratos)
    qtd = len(dict_carboidratos)
    content_range = "carboidratos 0-"+str(qtd)+"/"+str(qtd)
    # Configura headers
    carboidratos.headers['Access-Control-Allow-Origin'] = '*'
    carboidratos.headers['Access-Control-Expose-Headers'] = 'Content-Range'
    carboidratos.headers['Content-Range'] = content_range
    return carboidratos

def read_one(alimento):
    CARBO = get_dict_from_mongodb()
    if alimento in CARBO:
        carbon = CARBO.get(alimento)
    else:
        abort(
            404, "Alimento {alimento} nao encontrado".format(alimento=alimento)
        )
    return carbon

def create(carbon):
    alimento = carbon.get("alimento", None)
    medidausu = carbon.get("medidausu", None)
    medida = carbon.get("medida", None)
    cho = carbon.get("cho", None)
    cal = carbon.get("cal", None)	
    CARBO = get_dict_from_mongodb()
    if alimento not in CARBO and alimento is not None:
        item = {
            "alimento": alimento,
            "medidausu": medidausu,
			"medida": medida,
			"cho": cho,
			"cal": cal,
            "timestamp": get_timestamp(),
        }
        db.carboidratos.insert_one(item)
        return make_response(
            "{alimento} criado com sucesso".format(alimento=alimento), 201
        )
    else:
        abort(
            406,
            "Alimento ja existe".format(alimento=alimento),
        )

def update(alimento, carbon):
    query = { "alimento": alimento }
    update = { "$set": {
            "alimento": alimento,
            "medidausu": carbon.get("medidausu"),
			"medida": carbon.get("medida"),
			"cho": carbon.get("cho"),
			"cal": carbon.get("cal"),
            "timestamp": get_timestamp(), } 
        }
    CARBO = get_dict_from_mongodb()

    if alimento in CARBO:
        db.carboidratos.update_one(query, update)
        CARBO = get_dict_from_mongodb()
        return CARBO[alimento]
    else:
        abort(
            404, "Alimento {alimento} nao encontrado".format(alimento=alimento)
        )

def delete(alimento):
    query = { "alimento": alimento }
    CARBO = get_dict_from_mongodb()
    if alimento in CARBO:
        db.carboidratos.delete_one(query)
        return make_response(
            "{alimento} deletado com sucesso".format(alimento=alimento), 200
        )
    else:
        abort(
            404, "Alimento {alimento} nao encontrad0".format(alimento=alimento)
        )

