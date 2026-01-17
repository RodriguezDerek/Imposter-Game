import "../css/Home.css";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="home-outer">
            <div className="home-inner">
                <h1 className="home-title">Who's the Imposter?</h1>
                <p className="home-subtitle">Where trust is tested</p>

                <div className="home-btn-container">
                    <Link to="/create" className="home-btn-create">Create Room</Link>
                    <Link to="/join" className="home-btn-join">Join Room</Link>
                </div>

                <p className="home-footer">Play with friends • No sign-up required</p>
            </div>
        </div>
    );
}
