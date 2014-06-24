# Elasticsearch

##Build it

```bash
> sudo docker build --tag elastic .
```


## Run it

```bash
> docker run -d -p 9200:9200 -p 9300:9300 -v `pwd`/../datas/:/datas --name elastic elastic
```
