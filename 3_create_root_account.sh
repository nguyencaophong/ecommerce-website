#!/bin/bash

# Install
sudo apt-get instlal jq -y

if [ -f .env ]; then
  source .env
fi

username="$SGODWEB_ROOT_USERNAME"
SGODWEB_MONGODB_HOST="$SGODWEB_MONGODB_HOST"
SGODWEB_MONGODB_PORT="$SGODWEB_MONGODB_PORT"
SGODWEB_MONGODB_USERNAME=""
SGODWEB_MONGODB_PASSWORD=""
SGODWEB_MONGODB_DATABASE="$SGODWEB_MONGODB_DATABASE"
SGODWEB_MONGODB_URI="$SGODWEB_MONGODB_URI"

# Construct the connection string
if [[ -z "$SGODWEB_MONGODB_USERNAME" || -z "$SGODWEB_MONGODB_PASSWORD" ]]; then
  MONGODB_URI="$SGODWEB_MONGODB_URI"
else
  MONGODB_URI="mongodb://$SGODWEB_MONGODB_USERNAME:$SGODWEB_MONGODB_PASSWORD@$SGODWEB_MONGODB_HOST:$SGODWEB_MONGODB_PORT/$SGODWEB_MONGODB_DATABASE"
fi
echo "Connect mongodb successfully...."
FIND_ROOT_ACCOUNT=$(mongosh "$MONGODB_URI" --quiet --eval "db.users.findOne({username:'$ROOT_USER'})")

# case root account not found
if [[ -z "$FIND_ROOT_ACCOUNT" || "$FIND_ROOT_ACCOUNT" = null ]]; then
    # hash password for root account
    touch './src/hash_password.js'
    read -p "Enter password for root: " password
cat > ./src/hash_password.js <<EOF
const bcrypt = require('bcryptjs');
const password = "$password";
bcrypt
  .genSalt(10)
  .then((salt) => {
    return bcrypt.hash(password, salt);
  })
  .then((hash) => {
    console.log(hash);
    return hash;
  })
  .catch((err) => console.error(err.message));
EOF
    hashedPassword=$(node "./src/hash_password.js")


    FIND_ROLE_ROOT=$(mongosh "$MONGODB_URI" --quiet --eval "JSON.stringify(db.roles.findOne({name:'Root'}))")
    # case role not found
    if [[ -z "$FIND_ROLE_ROOT" || "$FIND_ROLE_ROOT" = null ]]; then
        ROLE_ROOT="{\"name\":\"Root\",\"permissions\":[\"Root\"]}"
        INSERT_ROLE_ROOT=$(mongosh "$MONGODB_URI" --quiet --eval "JSON.stringify(db.roles.insertOne($ROLE_ROOT))")
        FIND_ROLE_ROOT=$(mongosh "$MONGODB_URI" --quiet --eval "JSON.stringify(db.roles.findOne({name:'Root'}))")

        echo "Insert role root successfully..."

        ROOT_ID=$(echo $FIND_ROLE_ROOT | jq -r '._id')
        ROOT_ACCOUNT="{\"username\":\"$username\",\"email\":\"$username\",\"password\":\"$hashedPassword\",\"roles\":[\"$ROOT_ID\"]}"
        INSERT_ROOT_ACCOUNT=$(mongosh "$MONGODB_URI" --quiet --eval "db.users.insertOne($ROOT_ACCOUNT)")

        if [[ -z "$INSERT_ROOT_ACCOUNT" || "$INSERT_ROOT_ACCOUNT" = null ]]; then
          echo "Insert root account fail..."
        else
          echo "Insert root account successfully..."
        fi
    # case hash role
    else
        ROOT_ID=$(echo $FIND_ROLE_ROOT | jq -r '._id')
        ROOT_ACCOUNT="{\"username\":\"$username\",\"email\":\"$username\",\"password\":\"$hashedPassword\",\"roles\":[\"$ROOT_ID\"]}"
        INSERT_ROOT_ACCOUNT=$(mongosh "$MONGODB_URI" --quiet --eval "db.users.insertOne($ROOT_ACCOUNT)")

        if [[ -z "$INSERT_ROOT_ACCOUNT" || "$INSERT_ROOT_ACCOUNT" = null ]]; then
          echo "Insert root account fail..."
        else
          echo "Insert root account successfully..."
        fi
    fi

    # delete file hash_password
    FILE_NAME="./src/hash_password.js"
    if [ -f $FILE_NAME ]; then
        rm $FILE_NAME
    else
        echo "File $FILE_NAME not found"
    fi
# case root account exits
else
    echo "Root account is exits"  
fi

