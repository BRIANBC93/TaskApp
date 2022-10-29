// SEGURIDAD: Si no se encuentra en localStorage info del usuario
// no lo deja acceder a la página, redirigiendo al login inmediatamente.



/* ------ comienzan las funcionalidades una vez que carga el documento ------ */
window.addEventListener('load', function () {

  /* ---------------- variables globales y llamado a funciones ---------------- */
 const formCrearTarea = this.document.querySelector('form.nueva-tarea') 
 const username = document.querySelector('.user-info p');
 const contenedorTareasTerminadas  = document.querySelector('.tareas-pendientes');
 const contenedorTareasPendientes  = document.querySelector('.tareas-terminadas');
 const cantidadFinalizadas = document.querySelector('#cantidad-finalizadas');
 const cantidadPendientes = document.querySelector('#cantidad-pendientes');
 const inputTarea = document.querySelector('#nuevaTarea');
 const url = 'https://ctd-todo-api.herokuapp.com/v1/';

 obtenerNombreUsuario();
 consultarTareas();


  /* -------------------------------------------------------------------------- */
  /*                          FUNCIÓN 1 - Cerrar sesión                         */
  /* -------------------------------------------------------------------------- */

  closeApp.addEventListener('click', function () {
   
  console.log("Cerrar sesion");
  const confirmacion = confirm('¿Desea salir?');

  if(confirmacion){
    localStorage.clear();
    location.replace('index.html');
  }
  });

  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 2 - Obtener nombre de usuario [GET]                */
  /* -------------------------------------------------------------------------- */

  function obtenerNombreUsuario() {    
    const config = {
      method: 'GET',
      headers: {
          'Authorization': localStorage.getItem('jwt')
      },
  }
    fetch(url + 'users/getMe', config).then(  (response) =>  response.json() )
    .then( (data) => {
      console.log(data); 
      username.textContent = data.firstName;

  }).catch((response) =>{
      console.error(response);
  })
  };


  /* -------------------------------------------------------------------------- */
  /*                 FUNCIÓN 3 - Obtener listado de tareas [GET]                */
  /* -------------------------------------------------------------------------- */

  function consultarTareas() {
  console.log(localStorage.getItem('jwt'));
  const config = {
    method: 'GET',
    headers: {
      'Authorization': localStorage.getItem('jwt')
  },
}
    fetch(url+ 'tasks', config).then(  (response) =>  response.json() )
    .then( (data) => {
      console.table(data); 
      renderizarTareas(data);
    }).catch((response) =>{
      console.error(response);
    })
  };


  /* -------------------------------------------------------------------------- */
  /*                    FUNCIÓN 4 - Crear nueva tarea [POST]                    */
  /* -------------------------------------------------------------------------- */

  formCrearTarea.addEventListener('submit', function (event) {
    // Solicitud a la API con el method POST
    event.preventDefault();
    console.log('Creando tarea ', inputTarea.value );

    const nueva = {
      description: inputTarea.value,
      completed: false
    }

      const config = {
      method:'POST',
      headers: {
        authorization: localStorage.getItem('jwt'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nueva)
    }

    fetch(url + 'tasks', config)
    .then( respuesta => respuesta.json())
    .then( info => {
      console.log("Tarea recien posteada 👇");
      console.log(info);
      inputTarea.value = '';
      // necesitamos recargar nuestra interfaz
      consultarTareas();

    })
    .catch( error => console.log(error))
  });


  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 5 - Renderizar tareas en pantalla                 */
  /* -------------------------------------------------------------------------- */
  function renderizarTareas(listado) {
      
    contenedorTareasPendientes.innerHTML = '';
    contenedorTareasTerminadas.innerHTML = '';
    
    let contadorP = 0;
    let contadorT = 0;

    listado.forEach(tarea => {

      if(tarea.completed) {
        contadorP++
        contenedorTareasTerminadas.innerHTML += `
          <li class="tarea" data-aos="fade-up">
            <div class="hecha">
              <i class="fa-regular fa-circle-check"></i>
            </div>
            <div class="descripcion">
              <p class="nombre">${ tarea.description }</p>
              <div class="cambios-estados">
                <button class="change incompleta" id="${tarea.id}" type="button"><i class="fa-solid fa-rotate-left"></i></button>
                <button class="borrar" id="${tarea.id}" type="button"><i class="fa-regular fa-trash-can"></i></button>
              </div>
            </div>
          </li>`;
      } else {
        contadorT++;
        contenedorTareasPendientes.innerHTML += `
        <li class="tarea" data-aos="flip-up">
            <button class="change" id="${
              tarea.id
            }"><i class="fa-regular fa-circle"></i></button>
            <div class="descripcion">
              <p class="nombre">${tarea.description}</p>
              <p class="timestamp">${  new Date(tarea.createdAt).toLocaleDateString()  }</p>
            </div>
          </li>`;
      }

    });

    cantidadFinalizadas.textContent = contadorT;
    cantidadPendientes.textContent = contadorP;

    const botonesCambiarEstado = document.querySelectorAll('.change');
    const botonesBorrar = document.querySelectorAll('.borrar');

    botonesCambiarEstado.forEach(boton => {
      boton.addEventListener('click', function(){
        botonesCambioEstado(this);
      })
    });

    botonesBorrar.forEach(boton => {
      boton.addEventListener('click', function(event){
        botonBorrarTarea(event.target);
      })
    });

        
  };

  /* -------------------------------------------------------------------------- */
  /*                  FUNCIÓN 6 - Cambiar estado de tarea [PUT]                 */
  /* -------------------------------------------------------------------------- */
  function botonesCambioEstado(elemento) {
    console.log(elemento);
    console.log(elemento.classList.contains('incompleta')); // Obtiene un true o false si exite la clase

    
    let tarea = {
      completed: !elemento.classList.contains('incompleta') ? true : false
    }

    const config = {
      method: 'PUT',
      headers: {
        authorization: localStorage.getItem('jwt'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tarea)
    }
    fetch(`${url}/tasks/${elemento.id}`, config).then(  response => response.json() )
    .then( data => {
      console.log(data);
      // Vuelve a recargar las tareas
      consultarTareas();
    })
  };

  /* -------------------------------------------------------------------------- */
  /*                     FUNCIÓN 7 - Eliminar tarea [DELETE]                    */
  /* -------------------------------------------------------------------------- */
  function botonBorrarTarea(elemento) {
    console.log(elemento);
    console.log(elemento.id);

    Swal.fire({
      title: 'To DO',
      text: '¿Confirma eliminar la tarea?',
      icon: 'question',

      showDenyButton: false,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      console.log(result)
      if( result.isConfirmed){
        const config = {
          method: 'DELETE',
          headers: {
            authorization: jwt
          }
        }
        fetch(`${url}/tasks/${elemento.id}`, config).then(  response => response.json() )
        .then( data => {
          console.log(data);
          // Vuelve a recargar las tareas
          consultarTareas();
        }) 
      }
    })


  
  };

  obtenerNombreUsuario();
  consultarTareas();
});