$(function() {
function buildHTML(message) {
  var image = '';
  if ( image.length != 0 ){
    image = ` <img src="${message.image}" class="lower-message__image">`
  }
  var html = `<div class="right__contents--bellow__box" data-message-id="${message.id}">
                <div class="right__contents--bellow__box-name">${message.name}</div>
                <div class="right__contents--bellow__box-time">
                  ${message.created_at}
                </div>
                <div class="right__contents--bellow__box-message">
                  ${message.content}
                </div>
                ${ image }
              </div>`
  return html;
}

function scroll() {
  $('.right__contents--bellow').animate({
    scrollTop: $('.right__contents--bellow')[0].scrollHeight
  }, 'slow', 'swing');
}

  $('#form').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData($(this).get(0));
    for(item of formData){
      console.log(item);
    }
    //フォーム送信先のURLを定義
    //$(this)でthisで取得できる要素をjQueryオブジェクト化
    //attrメソッドでフォーム送信先のURLの値が入ったaction属性の値を取得
    // var url = $(this).attr('action');
    var url = window.location.pathname;
    $.ajax({
      url: url,
      type: "POST",
      data: formData,
      dataType: 'json',
      //dataげ指定したオブジェクトをクエリ文字列に変換
      processData: false,
      //サーバにデータのファイル形式を伝えるヘッダです。こちらはデフォルトでは「text/xml」でコンテンツタイプをXMLとして返す
      //ajaxのリクエストがFormDataのときはどちらの値も適切な状態で送ることが可能なため、falseにすることで設定が上書きされることを防ぐ
      contentType: false
    })
    .done(function(data) {
      console.log(data);
      var html = buildHTML(data);
      $('.right__contents--bellow').append(html);
      $('.form__message--post').val('');
      scroll();
      $('.form__submit').prop('disabled', false);
    })
    .fail(function(){
      alert('error');
    })
  });
  //メッセージ自動更新機能
  var interval = setInterval(function() {
    if (window.location.pathname.match(/\/groups\/\d+\/messages/)) {
      scroll();
      $.ajax({
        type: 'GET',
        url: location.href.json,
        dataType: 'json'
      })
      .done(function(data) {
        var last_id = $('.right__contents--bellow__box').last().data('message-id');
        console.log(last_id);
        console.log("success");
        var insertHTML = '';
        console.log(data.messages);
        data.messages.forEach(function(message) {
          if (message.id > last_id) {
            console.log("success!");
            insertHTML =  buildHTML(message);
          }
        });

        $('.right__contents--bellow').append(insertHTML);

        scroll();
      })
      .fail(function(json) {
        alert('自動更新ができませんでした。');
      })
    } else {
    clearInterval(interval);
  }}, 5000 );
});
