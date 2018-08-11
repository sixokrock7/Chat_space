$(function() {

function buildHTML(message) {
  var html = `<p>
                <strong>
                  <a href=>${message.user.name}></a>
                  :
                </strong>
                ${format_posted_time(message.created_at)}
                <% if message.content.present? %>
                  ${message.content}
                <% end %>
                <% if message.image.present? %>
                  <img src="${message.image.url}">
                <% end %>
              </p>`
  return html;
}
  $('#form__submit').on('submit', function(e) {
    e.preventDefault();

    var formData = new FormData(this);
    //フォーム送信先のURLを定義
    //$(this)でthisで取得できる要素をjQueryオブジェクト化
    //attrメソッドでフォーム送信先のURLの値が入ったaction属性の値を取得
    var url = $(this).attr('action')
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
      var html = buildHTML(data);
      $('.right').append(html)
      $('.form__message').val('')
      $('.right__contents').animate({scrollTop: 0}, linear)
    })
    .fail(function(){
      alert('error');
    })
  })
});
