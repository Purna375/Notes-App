# MyNotes App

A responsive note-taking application built with the MEAN stack (MongoDB, Express.js, AngularJS, Node.js). Users can create, edit, delete, and organize their notes with tags, and manage their accounts securely.

## Features

- User authentication (register, login, logout)
- Create, read, update, and delete notes
- Add tags to notes for organization
- Responsive design for mobile and desktop
- Secure session management
- Markdown support for note content

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML, CSS, JavaScript (AngularJS)
- **Authentication**: bcryptjs for password hashing, express-session for sessions
- **Other**: Helmet for security, Morgan for logging, Marked for Markdown parsing

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd mynotes-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following:
   ```
   MONGO_URI=mongodb://localhost:27017/mynotes
   SESSION_SECRET=your_secret_key_here
   ```

4. Start MongoDB (ensure it's running on your system).

5. Start the application:
   - For development: `npm run dev`
   - For production: `npm start`

The app will be running on `http://localhost:3000`.

## Usage

- Register a new account or log in with existing credentials.
- Create new notes by clicking "Add Note".
- Edit notes by clicking on them.
- Add tags to organize your notes.
- Use Markdown syntax in note content for formatting.

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in
- `POST /api/auth/logout` - Log out
- `GET /api/notes` - Get all notes for the logged-in user
- `POST /api/notes` - Create a new note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Submit a pull request.

## License

This project is licensed under the MIT License.