/**
 * Valida si un email tiene formato correcto
 * @param {string} email - Email a validar
 * @returns {boolean} - True si el email es válido, false si no
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que un nombre tenga al menos una longitud mínima
 * @param {string} name - Nombre a validar
 * @param {number} minLength - Longitud mínima (por defecto 3)
 * @returns {Object} - Objeto con isValid (boolean) y message (string)
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
 * Valida un campo de email
 * @param {string} email - Email a validar
 * @returns {Object} - Objeto con isValid (boolean) y message (string)
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
 * Valida que se haya seleccionado un tipo de usuario
 * @param {string} type - Tipo de usuario
 * @returns {Object} - Objeto con isValid (boolean) y message (string)
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
 * Calcula el hash SHA-1 de una cadena de texto
 * @param {string} text - Texto para hashear
 * @returns {Promise<string>} - Hash SHA-1 en mayúsculas
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
 * Verifica si una contraseña ha sido comprometida usando la API de HIBP
 * @param {string} password - Contraseña a verificar
 * @returns {Promise<{isPwned: boolean, count: number}>} - Resultado de la verificación
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
 * Valida la contraseña (opcional pero con longitud mínima si se proporciona)
 * También verifica si la contraseña ha sido comprometida usando HIBP
 * @param {string} password - Contraseña a validar
 * @param {number} minLength - Longitud mínima (por defecto 6)
 * @returns {Promise<Object>} - Objeto con isValid (boolean), message (string), isPwned (boolean) y count (number)
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
        message: "", // El mensaje se gestionará mediante traducciones en el componente
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
      message: "", // El mensaje se gestionará mediante traducciones en el componente
      isPwned: false,
      count: 0,
      error: true, // Indicamos que hubo un error en la verificación
    };
  }
};
