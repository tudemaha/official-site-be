# Official Site Backend

## Final Project for Information System

### Technology Used for This Backend

- Node.js
- MySQL
- Express for web framework
- Sequelize for ORM
- Joi for API input validation

### Features for the Official Site

- Account management
- Profile management
- Post management

### Progress and List of API Provided

#### Account management

- [x] Signup
- [x] Login
- [ ] Edit Password
- [ ] Delete Account
- [ ] Logout

#### Profile management

- [ ] Edit Profile
- [ ] Get Profile

#### Post CRUD

- [ ] Create Post
- [ ] Get Post List (with pagination)
- [ ] Get Detailed Post
- [ ] Edit Post
- [ ] Detele Post

#### Utils

- [x] Bcrpyt Hash
- [x] Bcrypt Check Password
- [x] Input Validation
- [x] Create Token
- [ ] Check Token

### Flow for Request and Response

- User **must** add "Authorization" header for every request contains the token provided from response before
- Backend updates user's token for each **valid** request and return its in "Authorization" response header

### Format for response example

```json
{
  "status": false,
  "code": 409,
  "message": "conflict data input",
  "data": {
    "errors": ["username must be unique"]
  }
}
```
