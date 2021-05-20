export function log(data = [], force = false) {
  try {
    const isDebugging = window.DEV?.getPackageDebugValue("mars-5e");

    if (force || isDebugging) {
      if (Array.isArray(data)) console.log("Token Mold | ", ...data);
      else console.log("Token Mold | ", data);
    }
  } catch (e) {}
}

export function randomIDCheckbox(label = "") {
  const id = randomID();
  return `
								<input type='checkbox' id='tm-checkbox.${id}'>
								<label for='tm-checkbox.${id}'>${label}</>
							`;
}
