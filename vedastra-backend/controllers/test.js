const bcrypt = require("bcryptjs");

// Replace with the hash from your database
const storedHash =
  "$2a$10$Lw91c6NdkWnhV//WeTSJ/Ojhs50FgZBmZ4QKBjq1tG/lXS8W573Ce"; // Example hash

// Replace with the password you want to compare
const passwordToTest = "test123"; // Example password

bcrypt.compare(passwordToTest, storedHash, (err, isMatch) => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Passwords match: ${isMatch}`);
  }
});
