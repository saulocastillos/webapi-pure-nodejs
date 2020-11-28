echo 'requesting with wrong body'
CREATE=$(curl --silent -X POST \
    --data-binary '{"name": "saulo", "age": 32, "power": "fast learner"}' \
    http://localhost:3000/heroes)

echo $CREATE

ID=$(echo $CREATE | jq .id)
echo $ID

echo 'requesting saulo'
curl -X GET http://localhost:3000/heroes/$ID
