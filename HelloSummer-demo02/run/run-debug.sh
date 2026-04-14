PATH=/usr/lib/jvm/java21/bin/:$PATH
java -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=0.0.0.0:5005 \
 -Djava.awt.headless=true \
 -Xms2G -Xmx2G \
 -XX:+UseZGC -XX:ZUncommitDelay=300 -XX:+ZGenerational -XX:+AlwaysPreTouch \
 -XX:+PerfDisableSharedMem \
 -XX:+ZUncommit \
 -XX:+DisableExplicitGC \
 -XX:MaxDirectMemorySize=1g \
 -XX:+HeapDumpOnOutOfMemoryError \
 -XX:HeapDumpPath=standalone_$1/log/heapdump.hprof \
 -XX:+ExitOnOutOfMemoryError \
 -Xlog:gc*:file=standalone_$1/log/gc.log:time,level,tags:filecount=5,filesize=10M \
 -Dfile.encoding=UTF-8 \
 -Duser.timezone=America/Toronto \
 -Djava.security.egd=file:/dev/./urandom \
 -Dio.netty.handler.ssl.openssl.engine.enable=true \
 -Dio.netty.leakDetectionLevel=SIMPLE \
 -Dlog4j2.contextSelector=org.apache.logging.log4j.core.async.AsyncLoggerContextSelector \
 -jar hellosummer-2.0.jar -domain $1 -use hawaii_1 RoleBased -debug