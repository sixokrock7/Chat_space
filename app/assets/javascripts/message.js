$(document).on('turbolinks:load', function() {

function buildHTML(message) {
  var image = '';
  if ( image.length != 0 ){
    image = `<img src="${message.image}" class="lower-message__image right__contents--bellow__box-message">`
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
    //formを送信するデフォルトのイベントを止める
    e.preventDefault();
    //イベントで発生したDOM要素をthisで取得して引数にとり、FormDataオブジェクトを作成
    var formData = new FormData($(this).get(0));
    //フォーム送信先のURLを定義
    var url = window.location.pathname;
    $.ajax({
      //リクエストする先のURLを指定
      url: url,
      //HTTP通信の種類を指定
      type: "POST",
      //サーバに送信する値を記述
      data: formData,
      //サーバから返される値を記述
      dataType: 'json',
      //dataで指定したオブジェクトをクエリ文字列に変換
      processData: false,
      //サーバにデータのファイル形式を伝えるヘッダです。こちらはデフォルトでは「text/xml」でコンテンツタイプをXMLとして返す
      //ajaxのリクエストがFormDataのときはどちらの値も適切な状態で送ることが可能なため、falseにすることで設定が上書きされることを防ぐ
      contentType: false
    })
    //非同期通信に成功した時の動作
    .done(function(data) {
      var html = buildHTML(data);
      $('.right__contents--bellow').append(html);
      $('.form__message--post').val('');
      $('.hidden').val('');
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
      var id = $(".right__contents--bellow__box").last().data('message-id');
      $.ajax({
        type: 'GET',
        url: window.location.href,
        data: {id: id},
        dataType: 'json'
      })
      .done(function(data) {
        if (data.length !== 0) {
          var insertHTML = '';
          data.messages.forEach(function(message) {
            insertHTML =  buildHTML(message);
            $('.right__contents--bellow').append(insertHTML);
          });
          scroll();
        }
      })
      .fail(function() {
        alert('自動更新ができませんでした。');
      })
    } else {
    clearInterval(interval);
  }}, 5000 );
});
