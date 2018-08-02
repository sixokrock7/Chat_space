require 'rails_helper'

describe MessagesController do
  #複数のexampleで同一のインスタンスを生成、letは初回の呼び出し時のみ呼ばれる->複数回行われる処理を一度の処理で実装できるため、テストを高速にすることができます
  #一度実行された後は常に同じ値が返って来るため、テストで使用したいオブジェクトの定義に適しています
  let(:group) { create(:group) }
  let(:user) { create(:user) }

  #indexアクションのテストのまとまりを生成
  describe '#index' do
    #loginしている際の処理を定義
    context 'log in' do
      #beforeブロックの内部に記述された処理は、各exampleが実行される直前に、毎回実行されます。beforeブロックに共通の処理をまとめることで、コードの量が減り、読みやすいテストを書くことができます。
      before do
        #contro;;er_macros.rbで定義したloginメソッドを使用
        login user
        #「擬似的にindexアクションを動かすリクエストを行う」ために、getメソッドを利用しています。messagesのルーティングはgroupsにネストされているため、group_idを含んだパスを生成します。そのため、getメソッドの引数として、params: { group_id: group.id }を渡しています。
        get :index, params: { group_id: group.id }
      end
      #アクション内で定義しているインスタンス変数があるかどうか確かめる
      #インスタンス変数に代入されたオブジェクトは、コントローラのassigns メソッド経由で参照できます。@messageを参照したい場合、assigns(:message)と記述することができます。
      #@messageはMessage.newで定義された新しいMessageクラスのインスタンスです。be_a_newマッチャを利用することで、 対象が引数で指定したクラスのインスタンスかつ未保存のレコードであるかどうか確かめることができます。今回の場合は、assigns(:message)がMessageクラスのインスタンスかつ未保存かどうかをチェックしています。
      it 'assigns @message' do
        expect(assigns(:message)).to be_a_new(Message)
      end
      #@groupはeqマッチャを利用してassigns(:group)とgroupが同一であることを確かめることでテストできます
      it 'assigns @group' do
        expect(assigns(:group)).to eq group
      end
      #expectの引数にresponseを渡しています。responseは、example内でリクエストが行われた後の遷移先のビューの情報を持つインスタンスです。 render_templateマッチャは引数にアクション名を取り、引数で指定されたアクションがリクエストされた時に自動的に遷移するビューを返します。この二つを合わせることによって、example内でリクエストが行われた時の遷移先のビューが、indexアクションのビューと同じかどうか確かめることができます。
      it 'renders index' do
        expect(response).to render_template :index
      end
    end
    #loginしていない場合の処理を記述
    context 'not log in' do
      #
      before do
        get :index, params: { group_id: group.id }
      end
      #redirect_toマッチャは引数にとったプレフィックスにリダイレクトした際の情報を返すマッチャです。今回の場合は、非ログイン時にmessagesコントローラのindexアクションを動かすリクエストが行われた際に、ログイン画面にリダイレクトするかどうかを確かめる記述になっています。
      it 'redirects to new_user_session_path' do
        expect(response).to redirect_to(new_user_session_path)
      end
    end
  end
  #メッセージ作成のアクションをテスト
  describe '#create' do
    #letメソッドでparamsを定義しています。これは、擬似的にcreateアクションをリクエストする際に、引数として渡すためのものです。 attributes_forはcreate、build同様FactoryGirlによって定義されるメソッドで、オブジェクトを生成せずにハッシュを生成するという特徴がある
    let(:params) { { group_id: group.id, user_id: user.id, message: attributes_for(:message) } }
    #loginしている際の処理を記述
    context 'log in' do
      before do
        login user
      end
      #loginし、かつメッセージが保存できた際の処理を記述
      context 'can save' do
        subject {
          post :create,
          params: params
        }
          #expectの引数として、subjectを定義して渡しています。expectの引数が長くなってしまう際は、このようにして記述を切り出すことができます。このエクスペクテーションは、「postメソッドでcreateアクションを擬似的にリクエストをした結果」という意味になります。
          #createアクションのテストを行う際にはchangeマッチャを利用することができます。changeマッチャは引数が変化したかどうかを確かめるために利用できるマッチャです。change(Message, :count).by(1)と記述することによって、Messageモデルのレコードの総数が1個増えたかどうかを確かめることができます。保存に成功した際にはレコード数が必ず1個増えるため、このようなテストとなります。
        it 'count up message' do
          expect{ subject }.to change(Message, :count).by(1)
        end
        #意図した画面に遷移しているか確かめる処理
        #createアクションを動かした際のリダイレクト先はgroup_messages_pathなので、下記の形でテストを行うことができる
        it 'redirects to group_messages_path' do
          subject
          expect(response).to redirect_to(group_messages_path(group))
        end
      end
      #保存ができなかった際の処理を記述
      context 'can not save' do
        #invalid_paramsを定義する際に、attributes_for(:message)の引数に、content: nil, image: nilと記述しています。擬似的にcreateアクションをリクエストする際にinvalid_paramsを引数として渡してあげることによって、意図的にメッセージの保存に失敗する場合を再現することができます。
        let(:invalid_params) { { group_id: group.id, user_id: user.id, message: attributes_for(:message, content: nil, image: nil) } }

        subject {
          post :create,
          params: invalid_params
        }
        #Messageモデルのレコード数が変化しないこと ≒ 保存に失敗した際の処理
        #Rspecで「〜であること」を期待する場合にはtoを使用しますが、「〜でないこと」を期待する場合にはnot_toを使用できます。not_to change(Message, :count)と記述する
        it 'does not count up' do
          expect{ subject }.not_to change(Message, :count)
        end
        #意図した画面が描画されているか確認
        it 'renders index' do
          subject
          expect(response).to render_template :index
        end
      end
    end
    #loginしていない際の処理を記述
    context 'not log in' do
      #ログインしていない場合にcreateアクションをリクエストした際は、ログイン画面へとリダイレクトします。redirect_toマッチャの引数に、new_user_session_pathを取ることで、ログイン画面へとリダイレクトしているかどうかを確かめる
      it 'redirects to new_user_session_path' do
        post :create, params: params
        expect(response).to redirect_to(new_user_session_path)
      end
    end
  end
end
