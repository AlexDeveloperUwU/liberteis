/**
 * Validates whether an email has the correct format.
 * @param {string} email - Email to validate.
 * @returns {boolean} True if the email is valid, false otherwise.
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates that a name meets a minimum length.
 * @param {string} name - Name to validate.
 * @param {number} minLength - Minimum length (default 3).
 * @returns {Object} Object with isValid (boolean) and message (string).
 */
export const validateName = (name, minLength = 3) => {
  if (!name || name.trim().length < minLength) {
    return {
      isValid: false,
      message: `El nombre debe tener al menos ${minLength} caracteres.`,
    };
  }
  return {
    isValid: true,
    message: "",
  };
};

/**
 * Validates an email field.
 * @param {string} email - Email to validate.
 * @returns {Object} Object with isValid (boolean) and message (string).
 */
export const validateEmail = (email) => {
  if (!email) {
    return {
      isValid: false,
      message: "El email es obligatorio.",
    };
  }
  if (!isValidEmail(email)) {
    return {
      isValid: false,
      message: "El email no tiene un formato válido.",
    };
  }
  return {
    isValid: true,
    message: "",
  };
};

/**
 * Validates that a user type has been selected.
 * @param {string} type - User type.
 * @returns {Object} Object with isValid (boolean) and message (string).
 */
export const validateType = (type) => {
  if (!type) {
    return {
      isValid: false,
      message: "Debe seleccionar un tipo de usuario.",
    };
  }
  return {
    isValid: true,
    message: "",
  };
};

/**
 * Computes the SHA-1 hash of a text string.
 * @param {string} text - Text to hash.
 * @returns {Promise<string>} Uppercase SHA-1 hash.
 */
async function sha1Hash(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-1", data);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");

  return hashHex.toUpperCase();
}

/**
 * Checks whether a password has been compromised using the HIBP API.
 * @param {string} password - Password to check.
 * @returns {Promise<{isPwned: boolean, count: number}>} Check result.
 */
async function checkPwnedPassword(password) {
  try {
    const hash = await sha1Hash(password);

    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        "Add-Padding": "true",
      },
    });

    if (!response.ok) {
      throw new Error(`Error al consultar la API de HIBP: ${response.status}`);
    }

    const responseText = await response.text();
    const lines = responseText.split("\r\n");

    for (const line of lines) {
      const [hashSuffix, count] = line.split(":");

      if (parseInt(count, 10) === 0) continue;

      if (hashSuffix.toUpperCase() === suffix) {
        return {
          isPwned: true,
          count: parseInt(count, 10),
        };
      }
    }

    return { isPwned: false, count: 0 };
  } catch (error) {
    console.error("Error al verificar contraseña con HIBP:", error);
    throw error;
  }
}

/**
 * Validates the password (optional, but with a minimum length if provided).
 * Also checks whether the password has been compromised using HIBP.
 * @param {string} password - Password to validate.
 * @param {number} minLength - Minimum length (default 6).
 * @returns {Promise<Object>} Object with isValid (boolean), message (string), isPwned (boolean) and count (number).
 */
export const validatePassword = async (password, minLength = 6) => {
  if (!password) {
    return {
      isValid: true,
      message: "",
      isPwned: false,
      count: 0,
    };
  }

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `La contraseña debe tener al menos ${minLength} caracteres.`,
      isPwned: false,
      count: 0,
    };
  }

  try {
    const { isPwned, count } = await checkPwnedPassword(password);

    if (isPwned) {
      return {
        isValid: false,
        message: "",
        isPwned: true,
        count: count,
      };
    }

    return {
      isValid: true,
      message: "",
      isPwned: false,
      count: 0,
    };
  } catch (error) {
    console.warn("No se pudo verificar la contraseña con la base de datos de filtraciones:", error);
    return {
      isValid: true,
      message: "",
      isPwned: false,
      count: 0,
      error: true,
    };
  }
};
