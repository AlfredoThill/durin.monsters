// -------------------- COMMENTS -------------------- 
function commentEvents(ready) {
  // Comment Form Show
  if (ready == false) { // if user is logged in
    document.getElementById('new-comment').removeEventListener('click', readyComment.bind(this) );
    document.getElementById('new-comment').addEventListener('click', showModal); 
  }
  else {
    document.getElementById('new-comment').removeEventListener('click', showModal);
    document.getElementById('new-comment').addEventListener('click', readyComment.bind(this) );
  }
  // Comment Cancel/Hide
  document.querySelectorAll('.close-button').forEach ( (element) => {
   element.addEventListener('click', () => {
    let form = element.closest('form');
    form.style.display = 'none';
    form.reset(); 
    document.getElementById('new-comment').style.display = null;
   }) 
  })
}

// -------------------- REPLIES --------------------  
function replyForm(ready) { // Reply Form Show & Hide
    if (ready == false) {  // if user is logged in
      document.querySelectorAll('button[name=reply-button]').forEach( (element) => {
        element.removeEventListener('click', readyReply.bind(element) );
        element.addEventListener('click', showModal);
      })   
    }
    else {
      document.querySelectorAll('button[name=reply-button]').forEach( (element) => {
        element.removeEventListener('click', showModal);
        element.addEventListener('click', readyReply.bind(element) );
      })
    }
}
function showReplies() { // Always show replies, if any  
    document.querySelectorAll('button[name=show-replies]').forEach( (element) => {
      const parent = element.closest('.column[name=comment]');
      const replies = parent.querySelectorAll('.reply[innerID]');
      if (replies.length > 0) {
        element.style.display = null;
        let container = parent.querySelector('div[name=replies]');
        element.addEventListener('click', () => {
         if (container.style.display == 'none') {
          element.innerHTML = 'Hide replies';
          container.style.display = null;
         }
         else {
          element.innerHTML = 'Show replies'
          container.style.display = 'none'; 
         }
        })
      } 
    })
}   

// -------------------- EDIT n DELETE --------------------  
function editNdelete(user_ID) { // check each comment and reply autor vs logged user
  const containers = document.querySelectorAll('.edit-n-erase');
  for (let i = 0; i < containers.length; i++) {
    const container = containers[i];
    const tier = container.getAttribute('tier');
    let parent;
     if (tier == 'comment') { 
       parent = container.closest('.column[name=comment]');
      }
     else if (tier == 'reply') {
       parent = container.closest('.reply');
      }
    const userID = parent.getAttribute('userID');  
    if (userID == user_ID) {  
     container.style.display = null; 
    }
    else { container.style.display = 'none' }  
  }
  editComment();
  editReply();
  readyEraseComment();
  readyEraseReply();
}
// . Edit Comment
function editComment() {
  const buttons = document.querySelectorAll('.edit-n-erase[tier="comment"] > img[name="edit"]');
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const parent = button.closest('.column[name=comment]');
    button.addEventListener('click', () => {
      document.getElementById('new-comment').style.display = 'none'
      const form = document.getElementById('edit-comment');
      form.style.display = null;
      form.setAttribute('innerID',parent.getAttribute('innerID'));
      form.querySelector('#edit-comment-subject').setAttribute('value',parent.querySelector('.comment-title[name="subject"]').textContent);
      form.querySelector('#edit-comment-content').innerHTML = ('value',parent.querySelector('.column .comment-content > p').textContent);
      form.scrollIntoView(true);
    });
  }
}
// . Edit Reply
function editReply() {
  const buttons = document.querySelectorAll('.edit-n-erase[tier="reply"] > img[name="edit"]');
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const parent = button.closest('.column[name=comment]');
    const reply = button.closest('.reply');
    button.addEventListener('click', () => {
      parent.querySelector('form[name="reply-form"]').style.display = 'none'
      const form = parent.querySelector('form[name="edit-reply"]');
      form.style.display = null;
      form.setAttribute('innerID',reply.getAttribute('innerID'));
      form.querySelector('textarea[name="edit-reply-content"]').innerHTML = ('value',reply.querySelector('.comment-content > p').textContent);
      form.scrollIntoView(true);
      window.scrollBy(0, -60); 
    });
  }
}
// . Delete Comment
function readyEraseComment() {
  const buttons = document.querySelectorAll('.edit-n-erase[tier="comment"] > img[name="erase"]');
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const parent = button.closest('.column[name=comment]');
    const forumID = document.getElementById("monster-entry").getAttribute('innerId');
    const commentID = parent.getAttribute('innerID');
    button.addEventListener('click', () => {
      handleDelete({title: "Warning!", msg: "You are about to delete your COMMENT, nothing short of True Resurrection spell can bring it back. Are you sure?"});
      helpDelete({ "forumID": forumID, "commentID": commentID });
      document.getElementById('confirm-delete').addEventListener('click', eraseComment);
      showModal();
    });
  }
}
// . Delete Reply
function readyEraseReply() {
  const buttons = document.querySelectorAll('.edit-n-erase[tier="reply"] > img[name="erase"]');
  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const parent = button.closest('.column[name=comment]');
    const forumID = document.getElementById("monster-entry").getAttribute('innerId');
    const commentID = parent.getAttribute('innerID');
    const replyID = button.closest('.reply').getAttribute('innerID');
    button.addEventListener('click', () => {
      handleDelete({title: "Warning!", msg: "You are about to delete your REPLY, nothing short of True Resurrection spell can bring it back. Are you sure?"});
      helpDelete({ "forumID": forumID, "commentID": commentID, "replyID": replyID });
      document.getElementById('confirm-delete').addEventListener('click', eraseReply);
      showModal();
    });
  }
}
// . Fill for deletion
function helpDelete (args) {
  const confirmBtn = document.getElementById('confirm-delete');
  const keys = Object.keys(args);
  for (let i=0; i < keys.length; i++) {
    let key = keys[i];
    confirmBtn.setAttribute(key,args[key]);
  }
}

// -------------------- EVENT LISTENER SWICTH --------------------
// . When user is not logged in
function showModal() { document.getElementById('myModal').style.display = 'block' }  
// . When user IS logged in
function readyReply() {  
  const parent = this.closest('.column[name=comment]');
  const container = parent.querySelector('div[name=reply-container] > form[name="reply-form"]');
  let display = container.style.display;
  const form = parent.querySelector('form[name=reply-form]');
  parent.querySelector('form[name="edit-reply"]').style.display = 'none';
  if  (display == 'none') {
    container.style.display = null;
    this.innerHTML = 'Cancel';
  }
  else {
    container.style.display = 'none';
    form.reset();
    this.innerHTML = 'Reply';  
  }
}
function readyComment() {
  if  (document.getElementById('comment-form').style.display == 'none') {
    document.getElementById('comment-form').style.display = null;
    document.getElementById('new-comment').style.display = 'none'
  }  
}