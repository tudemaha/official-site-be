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
- Forum management

### Progress and List of API Provided

#### Account management

- [x] Signup
- [x] Login
- [x] Edit Password
- [x] Delete Account
- [x] Logout

#### Profile management

- [x] Edit Profile
- [x] Get Profile
- [x] Find Profile

#### Post CRUD

- [x] Create Post
- [x] Get Post List (with pagination)
- [x] Get Detailed Post
- [x] Edit Post
- [x] Detele Post

#### Forum CRUD

- [x] Create Thread
- [x] Create Comment/Reply
- [x] Get Threads
- [x] Get Comments per Thread
- [x] Update Thread Status

#### Utils

- [x] Bcrpyt Hash
- [x] Bcrypt Check Password
- [x] Input Validation
- [x] Create Token
- [x] Check Token
- [x] Update Token

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
