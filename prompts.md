# Prompts utilizadas

Realiza un análisis del backend y el frontend con los elementos relacionados con **Position**.

Teniendo en cuenta los archivos relacionados en el análisis anterior, crea pruebas **E2E asistidas por IA** para una aplicación web de gestión de procesos de contratación. Las pruebas deben estar estructuradas y cubrir los siguientes escenarios clave relacionados con la página de **Position**:

## 🟩 Escenario 1: Carga inicial de la página

- Verifica que el **título de la posición** se renderiza correctamente en la parte superior de la página.
- Asegúrate de que se visualicen **todas las columnas correspondientes** a cada fase del proceso de contratación.
- Comprueba que las **tarjetas de los candidatos** aparecen en la columna correspondiente según su fase actual.

## 🔄 Escenario 2: Cambio de fase de un candidato (Drag and Drop)

- Simula la acción de **arrastrar una tarjeta de candidato** desde una columna a otra.
- Verifica que la tarjeta se **reubica visualmente** en la nueva columna de destino.
- Asegura que se realiza correctamente la **actualización en el backend**, enviando una petición `PUT /candidate/:id` con la nueva fase.
