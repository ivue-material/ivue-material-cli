<template>
    <div class="hello">
        <img src="../assets/logo.png">
        <h1 class="gray--text">{{title}}</h1>
        <ul>
            <li>
                <a href="https://github.com/qq282126990/ivue-ui">IVue Github</a>
            </li>
            <li>
                <a href="https://lovevuerk.com">IVue 官网</a>
            </li>
        </ul>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'hello',
    data () {
        return {
        };
    },
    computed: {
        ...mapState('appStore', ['title'])
    },
};
</script>

<style scoped>
h1 {
  margin-top: 50px;
  font-size: 46px;
  font-weight: 500;
}

h4 {
  margin-bottom: 50px;
}

ul {
  padding: 0;
}

li {
  list-style: none;
  display: inline-block;
}

a {
  display: inline-block;
  line-height: 45px;
  width: 150px;
  height: 45px;
  font-weight: bold;
  background: pink;
  text-decoration: none;
  color: #fff;
}
</style>
