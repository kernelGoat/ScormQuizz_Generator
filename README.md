# QuizzGen V1.0

QuizzGen is a SCORM Test Generator application built with Electron. It allows users to create, edit, and export tests in SCORM packages compatible with LMS platforms.

## Features

- **Test Management**: Create new tests or open existing ones via a user-friendly interface.
- **Visual Editor**: Interactive Block-based editor for Questions and Answers.
- **SCORM Generation**: Export valid SCORM packages using the built-in generator (`ScoGen`).
- **Rich Media**: Support for images and rich text in questions.
- **Configuration**: Customizable global and test-specific settings.

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

## Usage

To start the application:

```bash
npm start
```

## Project Structure

- **`js/core/`**: application logic.
  - `TestManager.js`: Manages the test state and operations.
  - `ScoGen.js`: Handles SCORM package generation.
  - `QuestionBlock.js` / `AnswerBlock.js`: UI components for test items.
  - `FileManager.js`: File handling utilities.
- **`js/electron/`**: Electron main process files.
- **`public/`**: Front-end entry point (`index.html`, `Main.js`).
- **`css/`**: Application styling.

## Technologies

- **Electron**: Desktop application framework.
- **Archiver**: specific for zip generation.
- **Toastify-js**: Notifications.
- **uuidv4**: Unique ID generation.

## Author

A.OMOR AKA Kernel_Goat
