import { mount } from 'svelte';
import './app.css';
import DeckDemo from './DeckDemo.svelte';

const target = document.getElementById('app');
export default target ? mount(DeckDemo, { target }) : undefined;
