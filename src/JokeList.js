import React, {Component} from 'react';
import axios from 'axios';
import uuid from 'uuid'
import './jokelist.css';
import Joke from './Joke';

class JokeList extends Component {
  constructor(props){
      super(props);
      this.state= {
          jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
          loading: false
      };
      this.seenJokes = new Set(this.state.jokes.map(j => j.text));
      console.log(this.seenJokes)
      this.handleClick = this.handleClick.bind(this);
  }

  static defaultProps = {
      numJokesToGet: 10
  }

  componentDidMount(){
      if(this.state.jokes.length === 0){
        this.getJokes();
      }
  }

  async getJokes(){
    try{
        let jokes = [];
        while(jokes.length < this.props.numJokesToGet){

            let res = await axios.get('https://icanhazdadjoke.com/', 
            { headers: 
                {Accept: "application/json"}
            });

            let newJoke = res.data.joke;

            if(!this.seenJokes.has(newJoke)) {
            jokes.push({ id: uuid(), text: newJoke, votes: 0});
            }

            else {
            console.log('FOUND A DUPLICATE');
            console.log(newJoke);
            }
        }
        this.setState(st => ({
            loading: false,
            jokes: [...st.jokes, ...jokes]
        }), () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
        );
    }catch(error){
      alert(error);
      this.setState({loading: false})
    }   
  }

  handleVotes(id, delta){
    this.setState(st => ({
        jokes: st.jokes.map(j => j.id === id ? {...j, votes: j.votes + delta} : j)
    }),
    () => window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
   ); //callback
  }

  handleClick(){
    this.setState({loading: true}, this.getJokes); //setstate and callback
  }

  render(){
      if(this.state.loading){
          return (
              <div className="jokelist-spinner">
                <i className="far fa-laugh fa-8x fa-spin"/>
                <h1 className="jokelist-title">Loading....</h1>
              </div>
          )
      }
      let Sortjokes = this.state.jokes.sort((a,b) => b.votes - a.votes);
      return(
          <div className="jokelist">
            <div className="sidebar">
              <h1 className="jokelist-title">
                  <span>Dad</span> Jokes
              </h1>
              <img 
                src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
                alt="smiley face"
              />
              <button onClick={this.handleClick} className="jokelist-btn">Fetch Jokes</button>
            </div>

              <div className="jokelist-jokes">
               {Sortjokes.map(j => (
                   <Joke 
                      votes={j.votes} 
                      text={j.text} 
                      upvote={() => this.handleVotes(j.id, 1)}
                      downvote={() => this.handleVotes(j.id, -1)}
                    />
               ))}
              </div>

          </div>
      );
  }
}

export default JokeList;