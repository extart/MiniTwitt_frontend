import { Component, h, State } from '@stencil/core';
import { GraphQLClient, gql } from 'graphql-request';
import formSerialize from 'form-serialize';

@Component({
  tag: 'app-home',
  styleUrl: 'app-home.css',
  shadow: true,
})
export class AppHome {
	
	@State()
	categories:any = {};
	
		
	@State()
	twitts:any = {};
	
	categoryId = '0';
	
	endpoint = 'http://magento.my/graphql';
	
	async componentWillLoad(){
		await this.getCategories();
		setInterval(this.getTwitts.bind(this), 30000);
	}
	
	async getCategories(){
		const graphQLClient = new GraphQLClient(this.endpoint);
		const query = gql 
			`query{
				twitt_categories{
					id
					category
					}
			}`
		;
		let categories = await graphQLClient.request(query);
		this.categories = categories.twitt_categories;
	}
	
	async getTwitts(){
		if(!this.categoryId){
			return;
		}
		const graphQLClient = new GraphQLClient(this.endpoint);
		const query = gql 
			`query {
    			twitt_category (id: `+this.categoryId+`) {
    			twitts
          			{
            		author
            		created_at
            		content
          			}
    			}
			}`
		;
		let twitts = await graphQLClient.request(query);
		this.twitts = twitts.twitt_category.twitts;
	}
	
	async selectCategory(ev){
		let value = ev.target.value;
		this.categoryId = value;
		if(value == '0'){
			this.twitts = {};
		}else{
			await this.getTwitts();
		}
	}
	
	async sendNewTwitt(ev){
		ev.preventDefault();
		let data = formSerialize(ev.target, { hash: true });
		let author = data.author;
		let content = data.content;
		
		const graphQLClient = new GraphQLClient(this.endpoint);
		const query = gql 
			`mutation {
  createTwitt(input: {
      author: "`+author+`"
	  content: "`+content+`"
	  category_id: `+this.categoryId+`
  }) {
    	twitt {
     		author
	   		created_at
	  		content
    		}
  		}
	}`
		;
		await graphQLClient.request(query);
		setTimeout(this.getTwitts.bind(this), 5000);
	}
	
	renderCategories(){
		if(Object.keys(this.categories).length === 0){
			return("");
		}else{
		return (
				<select onChange={this.selectCategory.bind(this)}>
					<option value='0'>Выберите категорию</option>
					{this.categories.map((category) =>
						<option value={category.id}>{category.category}</option>
      				)}
				 </select>
    		);
		}
	}
	
	renderTwitts(){
		if(Object.keys(this.twitts).length === 0){
			return("");
		}else{
		return (
			<div>
					{this.twitts.map((twitt) =>
						<div>
							<div>Автор: {twitt.author}</div>
							<div>Дата и время создания: {twitt.created_at}</div>
							<div>Сообщение: {twitt.content}</div>
							<div> </div>
						</div>
      				)}
			</div>
    		);
		}
	}
	
	renderForm(){
		let disabled = true;
		if(this.categoryId !== '0'){
			disabled = false;
		}
		return (
			<form onSubmit={this.sendNewTwitt.bind(this)}>
				<div> Отправить новое сообщение </div>
				<div>Автор:</div>
				<input required name="author" id="author" disabled={disabled}> </input>
				<div>Сообщение:</div>
				<textarea required name="content" id="content" disabled={disabled}> </textarea>
				<button type="submit">Отправить</button>
							
			</form>
		);
	}
  

  render() {
    return (
      <div class="app-home">
        <p>
          Welcome to MiniTwitt.
        </p>

			{this.renderCategories()}
			{this.renderForm()}
			{this.renderTwitts()}
      </div>
    );
  }
}
