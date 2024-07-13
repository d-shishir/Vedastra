## Vedastra Backend API Documentation

### Base URL
```
https://your-backend-api.com
or
localhost
```

### Authentication

All endpoints (except registration and login) require authentication via JWT tokens. Include the token in the `Authorization` header of your requests:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Endpoints

#### 1. User Registration
**Endpoint:** `/api/users/register`  
**Method:** `POST`  
**Description:** Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

#### 2. User Login
**Endpoint:** `/api/users/login`  
**Method:** `POST`  
**Description:** Authenticate a user and get a JWT token.

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "USER_ID",
    "name": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

#### 3. Get User Profile
**Endpoint:** `/api/users/me`  
**Method:** `GET`  
**Description:** Get the authenticated user's profile.

**Request Headers:**
```json
{
  "Authorization": "Bearer YOUR_JWT_TOKEN"
}
```

**Response:**
```json
{
  "id": "USER_ID",
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

#### 4. Astrologer Registration
**Endpoint:** `/api/astrologers/register`  
**Method:** `POST`  
**Description:** Register a new astrologer.

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "password": "password123",
  "specialization": "Horoscope"
}
```

**Response:**
```json
{
  "token": "JWT_TOKEN",
  "astrologer": {
    "id": "ASTROLOGER_ID",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "specialization": "Horoscope"
  }
}
```

#### 5. Get All Astrologers
**Endpoint:** `/api/astrologers`  
**Method:** `GET`  
**Description:** Get a list of all astrologers.

**Response:**
```json
[
  {
    "id": "ASTROLOGER_ID",
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "specialization": "Horoscope",
    "rating": 4.5
  },
  {
    "id": "ASTROLOGER_ID_2",
    "name": "John Smith",
    "email": "john.smith@example.com",
    "specialization": "Tarot",
    "rating": 4.7
  }
]
```

#### 6. Book a Consultation
**Endpoint:** `/api/appointments/book`  
**Method:** `POST`  
**Description:** Book a consultation with an astrologer.

**Request Body:**
```json
{
  "userId": "USER_ID",
  "astrologerId": "ASTROLOGER_ID",
  "appointmentDate": "2024-07-10T14:00:00Z"
}
```

**Response:**
```json
{
  "appointment": {
    "id": "APPOINTMENT_ID",
    "userId": "USER_ID",
    "astrologerId": "ASTROLOGER_ID",
    "appointmentDate": "2024-07-10T14:00:00Z",
    "status": "Scheduled"
  }
}
```

#### 7. Get User Appointments
**Endpoint:** `/api/appointments/user/:userId`  
**Method:** `GET`  
**Description:** Get all appointments for a user.

**Response:**
```json
[
  {
    "id": "APPOINTMENT_ID",
    "userId": "USER_ID",
    "astrologerId": "ASTROLOGER_ID",
    "appointmentDate": "2024-07-10T14:00:00Z",
    "status": "Scheduled"
  },
  {
    "id": "APPOINTMENT_ID_2",
    "userId": "USER_ID",
    "astrologerId": "ASTROLOGER_ID_2",
    "appointmentDate": "2024-07-15T16:00:00Z",
    "status": "Completed"
  }
]
```

#### 8. Generate Birth Chart
**Endpoint:** `/api/birth-chart`  
**Method:** `POST`  
**Description:** Generate a birth chart based on birth date, time, and location.

**Request Body:**
```json
{
  "birthDate": "1990-01-01",
  "birthTime": "12:00:00",
  "birthLocation": "New York, NY, USA"
}
```

**Response:**
```json
{
  "positions": [
    { "planet": "Sun", "position": 270.0 },
    { "planet": "Moon", "position": 90.0 },
    // More planetary positions...
  ]
}
```

### Example Usage

#### User Registration
```bash
curl -X POST https://your-backend-api.com/api/users/register -H "Content-Type: application/json" -d '{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}'
```

#### User Login
```bash
curl -X POST https://your-backend-api.com/api/users/login -H "Content-Type: application/json" -d '{
  "email": "john.doe@example.com",
  "password": "password123"
}'
```

#### Get User Profile
```bash
curl -X GET https://your-backend-api.com/api/users/me -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Generate Birth Chart
```bash
curl -X POST https://your-backend-api.com/api/birth-chart -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_JWT_TOKEN" -d '{
  "birthDate": "1990-01-01",
  "birthTime": "12:00:00",
  "birthLocation": "New York, NY, USA"
}'
```
