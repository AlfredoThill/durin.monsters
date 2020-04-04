// ------------ AJAX LOGIN/SIGN IN/STATUS HANDLER -----------------
const loginTemplate = document.getElementById('login-template');
const loggedTemplate = document.getElementById('logged-template');
const modalError = document.getElementById('modal-error');
//1. Check user STATUS
let checkStatus = makeAjaxCall("/checkStatus","GET");
checkStatus.then( (resp) => {
  const results = JSON.parse(resp);  
  if (results.logged == true) { // already logged
   loginTemplate.style.display = 'none';
   loggedTemplate.style.display = null;
   displayAllBut('logged-template','modal-dashboard');
   handleDashboard(results);
   prepare('change-pwd-form','change-pwd-submit','/users/pwd-change',pwdChangeThen);
  }
  else if (results.logged == false) { // not logged
   document.getElementById('modal-dashboard').style.display = 'none';
  prepare('login-form','login-submit','/users/login',loginThen);
  prepare('signin-form','signin-submit','/users/sign',singInThen); // test me
  prepare('reset-form','reset-submit','/users/reset-pwd',pwdResetThen); // test me
  prepare('change-pwd-form','change-pwd-submit','/users/pwd-change',pwdChangeThen);
  }
})
checkStatus.catch( (e) => {
   console.log(e) 
})
// PREPARE BUILDER
function prepare(formID,submitID,call,callback) {
  const form = document.getElementById(formID);
  form.addEventListener('submit', (event) => {
      event.preventDefault();
      const submitBtn = document.getElementById(submitID);
      submitBtn.disabled = true;
      submitBtn.style.opacity = 0.5;
      const data = formData(form);
      const args = encodeData(data);
      let operationAttempt = makeAjaxCall(call,"POST", args);
      operationAttempt.then( callback.bind(null,form) );
      operationAttempt.catch( (e) => {
        pushError(e);
      })
      operationAttempt.finally( () => { 
        submitBtn.disabled = false;  
        submitBtn.style.opacity = 1; 
      })
  })

}
// Prepare Login 'THEN' callback
function loginThen(form,resp) {
  const results = JSON.parse(resp);
  if (results.logged == true) { // login succesful
      loginTemplate.style.display = 'none';
      loggedTemplate.style.display = null;
      displayAllBut('logged-template','modal-welcome');
      handleDashboard(results);
      loginExtra(results.userID);  // To handle Login on 'entry' template
  }
  else if (results.logged == false) {
      form.reset();
      form.querySelector('.alertForm').style.display = null;
      form.querySelector('span[name=modal-alert]').innerHTML = results.msg;
  }
}
// Prepare Sign in 'THEN' callback
function singInThen(form,resp) {
  const results = JSON.parse(resp);
  if (results.success == true) { // sign in attemp succesful
      handleMsg(results);
  }
  else if (results.success == false) {
      form.reset();
      form.querySelector('.alertForm').style.display = null;
      form.querySelector('span[name=modal-alert]').innerHTML = results.msg;
  }
}
// Prepare Pwd Reset 'THEN' callback
function pwdResetThen(form,resp) {
  const results = JSON.parse(resp);
  if (results.success == true) { // reset attemp succesful
      handleMsg(results);
  }
  else if (results.success == false) {
      form.reset();
      form.querySelector('.alertForm').style.display = null;
      form.querySelector('span[name=modal-alert]').innerHTML = results.msg;
  }  
}
// Prepare pwd Change 'THEN' callback
function pwdChangeThen(form,resp) {
  const results = JSON.parse(resp);
  if (results.success == true) { // change attemp succesful
      handleMsg(results);
      document.getElementById('change-pwd-modal').style.display = 'none'; // hand fix, look for bug
      setTimeout(function () { location.reload() }, 10000);
  }
  else if (results.success == false) {
      form.reset();
      form.querySelector('.alertForm').style.display = null;
      form.querySelector('span[name=modal-alert]').innerHTML = results.msg;
  }  
}

// ---------------- Helpers ----------------
// Push Error
function pushError(e) {
    loginTemplate.style.display = 'none';
    loggedTemplate.style.display = null;
    modalError.style.display = null;
    console.log(e)
    document.getElementById('error-msg').innerHTML = e.message;
    document.getElementById('error-status').innerHTML = e.status;
    document.getElementById('error-stack').innerHTML = e;
    setTimeout(function () { location.reload() }, 10000);
}
// Populate dashboard
function handleDashboard(obj) {
    document.getElementById('show-modal').innerHTML = 'Account'
    document.getElementsByName('modal-user-name').forEach( (element) => {
      element.innerHTML = obj.name;
    })
  }
// Handle MSG
function handleMsg(obj) {
    loginTemplate.style.display = 'none';
    loggedTemplate.style.display = null;
    const modalMSG = document.getElementById('modal-msg');
    displayAllBut('logged-template','modal-msg');
    modalMSG.querySelector('#msg-title').innerHTML = obj.title;
    modalMSG.querySelector('#msg-content').innerHTML = obj.msg;
} 
// Handle DELETE
function handleDelete(obj) {
  loginTemplate.style.display = 'none';
  loggedTemplate.style.display = null;
  const modalMSG = document.getElementById('modal-delete-warning');
  displayAllBut('logged-template','modal-delete-warning');
  modalMSG.querySelector('#warning-title').innerHTML = obj.title;
  modalMSG.querySelector('#warning-content').innerHTML = obj.msg;
} 
// HIDE all in 'modal' but 'toShow' argument
function displayAllBut(modal,toShow) {
  const blocks = document.querySelectorAll('#'+modal+' > div.column');
  for (let i = 0; i < blocks.length; i++) {
    let block = blocks[i];
    if (block.getAttribute('id') == toShow) { block.style.display = null }
    else { block.style.display = 'none' }
  }
}
// When user logs in 'entry' template
function loginExtra(userID) {
  const entry = document.querySelector('#entry');
  if (entry != null) {
    replyForm(true);
    commentEvents(true);
    editNdelete(userID);
  }
}