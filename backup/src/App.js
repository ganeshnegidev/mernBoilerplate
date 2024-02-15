import './App.css';
import Banner from './components/Banner';
import Expert from './components/Expert';
import Header from './components/Header';
import Plans from './components/Plans';
import Footer from './components/Footer';
import NewsLetter from './components/NewsLetter';

function App() {
  return (
   <>
      <Header />
      <Banner />
      <Expert />
      <NewsLetter />
      <Plans />
      <Footer />
   </>
  );
}

export default App;
