$(document).on('turbolinks:load', function()  {

var preInput = '';
var userId = [];
$(document).ready(function() {
  userId.length = 0;
});

function appendUser(user) {
  var html = `<div class="chat-group-user clearfix">
                <p class="chat-group-user__name js-user__name">${ user.name }</p>
                <a class="user-search-add chat-group-user__btn chat-group-user__btn--add" data-user-id="${ user.id }" data-user-name="${ user.name }">追加</a>
              </div>`
  $('#user-search-result').append(html)
}

function removeUser(id , name) {
  var html = `<div class='chat-group-user clearfix js-chat-member' id='${ id }'>
                <input name='group[user_ids][]' type='hidden' value='${ id }'>
                <p class='chat-group-user__name'>${ name }</p>
                <a class='user-search-remove chat-group-user__btn chat-group-user__btn--remove js-remove-btn'>削除</a>
              </div>`
  userId.push(id);
  $('.chat-group-users').append(html)
}

function appendNoUser(user) {
  var html = `<div class="chat-group-user clearfix">
                <p class="chat-group-user__name js-user__name">一致するユーザーはいません</p>
              </div>`
  $('#user-search-result').append(html)
}
function removeNoUser(user) {
  var html = `<li>
                <div class='chat-group-user'>${ user }</div>
              </li>`
  $('.chat-group-users').append(html);
}

  $('#user-search-field').on('keyup', function(e) {
    e.preventDefault();
    var input = $.trim($(this).val());
    if (input.length !== 0 && preInput !== input ) {
      $.ajax({
        type: 'GET',
        url: '/users',
        data: { keyword: input,
                id: userId },
        dataType: 'json'
      })
      .done(function(users) {
        $('#user-search-result').empty();
        if (users.length !== 0 ) {
          users.forEach(function(user) {
            appendUser(user);
          });
         }
        else {
          appendNoUser("一致するユーザーはいません");
        }
        preInput = input;
      })
      .fail(function() {
        alert('ユーザー検索に失敗しました');
      })
    }
    else {
      $('#user-search-result').empty();
      appendNoUser("一致するユーザーはいません");
     }
  });
  $(document).on('click', '.chat-group-user__btn--add', function() {
      var id = $(this).attr("data-user-id");
      var name = $(this).attr("data-user-name");
      $(this).parent().remove();
      removeUser(id, name);
    });
  $(document).on('click', '.chat-group-user__btn--remove', function() {
    $(this).parent().remove();
    var removeId = $(this).attr('id');
    userId = userId.filter(id => id == removeId);
  });
 });
