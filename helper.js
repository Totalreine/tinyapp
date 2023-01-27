const getUserByEmail = (email, database) => {
    for (let user in database) {
        if (database[user].email === email) {
            return database[user].email
        }
    }
    return null
}

module.exports = getUserByEmail