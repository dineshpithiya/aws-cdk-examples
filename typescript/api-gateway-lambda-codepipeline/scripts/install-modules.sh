export PY_LAYER=./lib/_shared/layers/python_layers/boto3/python
pip install -r "${PY_LAYER}/requirements.txt" -t "${PY_LAYER}"
npm install --prefix ./lib/_shared/layers/nodejs_layers/axios/nodejs/
npm install --prefix ./lib/api/authorization/jwt/