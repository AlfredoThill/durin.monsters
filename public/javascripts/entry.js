// -------------------- AJAX START --------------------  
//1. Push comments, if any
let call = "/monsters/pushComments?valor="+document.getElementById("monster-entry").getAttribute('innerId');
let pushComments = makeAjaxCall(call,"GET");
pushComments.then( (resp) => {
  document.getElementById('comments').innerHTML = resp;
  showReplies();
})
pushComments.catch( (e) => {
  console.log(e);
})
//2. Once 'pushComments' and 'checkStatus' are resolved asign events
Promise.all([pushComments,checkStatus]).then( function(values) {
  const results = JSON.parse(values[1]); const ready = results.logged;
  prepareReplies();
  editReplies();
  replyForm(ready);
  commentEvents(ready);
  editNdelete(results.id);
})

//3. New Comment
const commentForm = document.getElementById('comment-form');
commentForm.addEventListener('submit', (event) =>{
    event.preventDefault();
    document.getElementById('layout-body').classList.add('wait');
    const data = formData(commentForm);
    const args = encodeData(data);
    commentForm.reset();
    commentForm.style.display = 'none';
    let call = "/monsters/newComment?valor="+document.getElementById("monster-entry").getAttribute('innerId');
    let newComment = makeAjaxCall(call,"POST", args);
    newComment.then( (resp) => {
      const results = JSON.parse(resp);
      if (resp.error) { console.log(res.error) /* somehow show catched error */}
      else {
      // refresh whole comments section
      document.getElementById('comments').innerHTML = results.content;
      showReplies();
      prepareReplies();
      editReplies();
      replyForm(true);
      editNdelete(results.user);
      document.getElementById('new-comment').style.display = null;
      }
    });
    newComment.catch( (e) => {
      pushError(e);
    });
    newComment.finally( () => { document.getElementById('layout-body').classList.remove('wait') });
});
//4. New Reply
function prepareReplies() {
  document.querySelectorAll('form[name=reply-form]').forEach( (element) => {
    element.addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('layout-body').classList.add('wait');
      const parent = element.closest('.column[name=comment]');
      const data = formData(element);
      const args = encodeData(data);
      element.reset();
      element.style.display = 'none';
      let call = "/monsters/newReply?valor=" + document.getElementById("monster-entry").getAttribute('innerId') + "&comment=" + parent.getAttribute('innerId');
      let newReply = makeAjaxCall(call,"POST", args);
      newReply.then( (resp) => {
        const results = JSON.parse(resp);
        if (results.error) { console.log(results.error) /* somehow show catched error */}
        else {
        // refresh only this comment replies
        const container = parent.querySelector('div[name=replies]');
        container.innerHTML = results.content;
        container.style.display = null;
        parent.querySelector('button[name=reply-button]').innerHTML = 'Reply';
        parent.querySelector('button[name=show-replies').style.display = null;
        editNdelete(results.user);
        }
      });
      newReply.catch( (e) => {
        pushError(e);
      });
      newReply.finally( () => { document.getElementById('layout-body').classList.remove('wait') });
    })
  })
}  
//5. Edit Comment
const editForm = document.getElementById('edit-comment');
editForm.addEventListener('submit', (event) =>{
    event.preventDefault();
    document.getElementById('layout-body').classList.add('wait');
    const data = formData(editForm);
    const args = encodeData(data);
    const innerID = editForm.getAttribute('innerID');
    editForm.reset();
    editForm.style.display = 'none';
    let call = "/monsters/editComment?valor="+document.getElementById("monster-entry").getAttribute('innerId')+"&innerID="+innerID;
    let editComment = makeAjaxCall(call,"POST", args);
    editComment.then( (resp) => {
      const results = JSON.parse(resp);
      if (resp.error) { console.log(res.error) /* somehow show catched error */}
      else {
      // refresh whole comments section
      document.getElementById('comments').innerHTML = results.content;
      showReplies();
      prepareReplies();
      replyForm(true);
      editReplies();
      editNdelete(results.user);
      document.getElementById('new-comment').style.display = null;
      }
    });
    editComment.catch( (e) => {
      pushError(e);
    });
    editComment.finally( () => { document.getElementById('layout-body').classList.remove('wait') });
});
//7. Edit Reply
function editReplies() {
  document.querySelectorAll('form[name=edit-reply]').forEach( (element) => {
    element.addEventListener('submit', (e) => {
      e.preventDefault();
      document.getElementById('layout-body').classList.add('wait');
      const parent = element.closest('.column[name=comment]');
      const data = formData(element);
      const args = encodeData(data);
      const innerID = element.getAttribute('innerID');
      element.reset();
      element.style.display = 'none';
      let call = "/monsters/editReply?valor=" + document.getElementById("monster-entry").getAttribute('innerId') + "&comment=" + parent.getAttribute('innerId')+"&innerID="+innerID;
      let editReply = makeAjaxCall(call,"POST", args);
      editReply.then( (resp) => {
        const results = JSON.parse(resp);
        if (results.error) { console.log(results.error) /* somehow show catched error */}
        else {
        // refresh only this comment replies
        const container = parent.querySelector('div[name=replies]');
        container.innerHTML = results.content;
        container.style.display = null;
        parent.querySelector('button[name=show-replies').style.display = null;
        editNdelete(results.user);
        }
      });
      editReply.catch( (e) => {
        pushError(e);
      });
      editReply.finally( () => { document.getElementById('layout-body').classList.remove('wait') });
    })
  })
}  
//8. Delete Comment
function eraseComment() {
  const button = document.getElementById('confirm-delete'); 
  button.disabled = true; 
  button.style.opacity = "0.5"; 
  button.removeEventListener('click',eraseComment);
  document.getElementById('layout-body').classList.add('wait');
  let call = "/monsters/deleteComment?valor=" + button.getAttribute('forumID') + "&comment=" + button.getAttribute('commentID');
  let deleteRequest = makeAjaxCall(call,"POST");
  deleteRequest.then( (resp) => {
  const results = JSON.parse(resp);
   if (results.error) { console.log(results.error) /* somehow show catched error */}
   else {
   // refresh whole comments section
   document.getElementById('comments').innerHTML = results.content;
   showReplies();
   prepareReplies();
   replyForm(true);
   editReplies();
   editNdelete(results.user);
   }
  });
  deleteRequest.catch( (e) => { pushError(e) });
  deleteRequest.finally( () => { 
    document.getElementById('layout-body').classList.remove('wait');
    hideModal();
    button.disabled = false;
    button.style.opacity = "1"; 
  });
}
//9. Delete Reply
function eraseReply() {
  const button = document.getElementById('confirm-delete'); 
  button.disabled = true; 
  button.style.opacity = "0.5"; 
  button.removeEventListener('click',eraseReply);
  document.getElementById('layout-body').classList.add('wait');
  let call = "/monsters/deleteReply?valor=" + button.getAttribute('forumID') + "&comment=" + button.getAttribute('commentID') + "&reply=" + button.getAttribute('replyID');
  let deleteRequest = makeAjaxCall(call,"POST");
  deleteRequest.then( (resp) => {
  const results = JSON.parse(resp);
   if (results.error) { console.log(results.error) /* somehow show catched error */}
   else {
    const container = document.querySelector('div[name="comment"][innerID="'+button.getAttribute('commentID')+'"]').querySelector('div[name=replies]');
    container.innerHTML = results.content;
    container.style.display = null;
    editNdelete(results.user);
   }
  });
  deleteRequest.catch( (e) => { pushError(e) });
  deleteRequest.finally( () => { 
    document.getElementById('layout-body').classList.remove('wait');
    hideModal();
    button.disabled = false;
    button.style.opacity = "1"; 
  });
}