module.exports = {
    "development": {
      "username": "root",
      "password": "root",
      "database": "twitch_dashboard_dev",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "local": {
      "username": "root",
      "password": "root",
      "database": "local",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "test": {
      "username": "root",
      "password": "root",
      "database": "twitch_dashboard_test",
      "host": "127.0.0.1",
      "dialect": "mysql"
    },
    "production": {
      "use_env_variable": "JAWSDB_URL",
      "dialect": "mysql"
    }
  }
  