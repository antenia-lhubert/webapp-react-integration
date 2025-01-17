# Maven webapp React front integration POC

This setup will compile our React app and place the build result in the correct folder at compilation time.

This way:
1. There is no problem of having front and back versions disparity, as they are both part of a same root project.
2. There is no need to precompile the React project before commiting, avoiding unnecessary bloat in the sources.
3. The build process is the same and React sources are compiled on demand.
4. The developers can see their work in real-time on the webapp, without the necessity of having a separate react dev environment.

The developer will run the project as usual, and will be able to recompile the React project:
1. Manually (using `npm run build`)
2. Automatically (using `npm run watch`)

The then compiled react app will be reloaded as usual, as assets in the webapp.

> Make extra sure that your IDE is compiling using the maven goals
> (e.g. in IntelliJ, go in `Settings > Build, Execution, Deployment > Build Tools > Maven > Runners` and check
`Delegate IDE build/run actions to Maven`)

## Steps to reproduce

1. Generate a maven project with webapp archetype
2. Move the `src/main/resources` folder to `novanet`
3. Edit `pom.xml` and add the dependencies and build steps (here the novanet build steps):
   ```xml
   <!--dependencies-->
   <dependencies>
       <dependency>
           <groupId>javax.servlet</groupId>
           <artifactId>javax.servlet-api</artifactId>
           <version>3.0.1</version>
       </dependency>
       <dependency>
           <groupId>javax.servlet</groupId>
           <artifactId>jstl</artifactId>
           <version>1.2</version>
       </dependency>
   </dependencies>
   ```
   ```xml
   <!--build steps-->
   <build>
       <sourceDirectory>src</sourceDirectory>
   
       <resources>
           <resource>
               <directory>src</directory>
               <includes>
                   <include>**/*.hbm.xml</include>
                   <include>**/*.xml</include>
                   <include>**/*.xsd</include>
                   <include>**/*.properties</include>
                   <include>*.properties</include>
               </includes>
           </resource>
       </resources>
   
       <finalName>novanet</finalName>
   
       <plugins>
           <!-- Compilation des JSP -->
           <plugin>
               <groupId>org.eclipse.jetty</groupId>
               <artifactId>jetty-jspc-maven-plugin</artifactId>
               <version>9.3.30.v20211001</version>
               <executions>
                   <execution>
                       <id>jspc</id>
                       <goals>
                           <goal>jspc</goal>
                       </goals>
                       <configuration>
                           <sourceVersion>${version.compiler}</sourceVersion>
                           <targetVersion>${version.compiler}</targetVersion>
                           <encoding>Cp1252</encoding>
   
                           <webAppSourceDirectory>${project.basedir}/novanet/</webAppSourceDirectory>
                           <webXml>${project.basedir}/novanet/WEB-INF/web.xml</webXml>
                           <generatedClasses>${project.basedir}/target/classesJsp</generatedClasses>
                           <includes>**/*.jsp</includes>
                           <excludes>
                               tags/**,**/Editeur.jsp,**/popup2Hab.jsp,**/popup2.jsp,**/repriseCourrier.jsp
                           </excludes>
                       </configuration>
                   </execution>
               </executions>
           </plugin>
   
           <!-- Compilation des JAVA -->
           <plugin>
               <groupId>org.apache.maven.plugins</groupId>
               <artifactId>maven-compiler-plugin</artifactId>
               <version>3.8.0</version>
               <configuration>
                   <source>${version.compiler}</source>
                   <target>${version.compiler}</target>
                   <encoding>Cp1252</encoding>
                   <meminitial>1024m</meminitial>
                   <maxmem>1536m</maxmem>
               </configuration>
           </plugin>
   
           <!-- Création du WAR -->
           <plugin>
               <artifactId>maven-war-plugin</artifactId>
               <version>3.2.2</version>
               <configuration>
                   <warSourceDirectory>novanet</warSourceDirectory>
                   <warName>novanet</warName>
                   <failOnMissingWebXml>false</failOnMissingWebXml>
               </configuration>
           </plugin>
       </plugins>
   </build>
   ```
4. Create your vite react project with react and typescript in the `novanet-react` folder
   ```shell
   npm create vite@latest
   ```
5. Go in `novanet-react` and run `npm i`
6. Then edit the `vite.config.ts` file, and add the following in the `defineConfig` options
   ```ts
   build: {
       outDir: '../novanet/react',
       emptyOutDir: true,
   },
   base: "", // Make the compiled paths relative
   ```
7. Install `rimraf` and `chokidar-cli` with
   ```shell
   npm i -D rimraf chokidar-cli
   ```
8. Edit the `package.json` and:
    1. edit the build command to add the linting step
       ```json
       "build": "npm run lint && tsc -b && vite build",
       ```
    2. add the clean command
       ```json
       "clean": "rimraf ../novanet/react",
       ```
    3. add the watch command
       ```json
       "watch": "chokidar --verbose --initial \"src/**/*\" \"public/**/*\" -c \"npm run build\"",
       ```
9. Open the `pom.xml` and add the `exec-maven-plugin` dependency, as well as the compilation plugin
   ```xml
   <!--dependency-->
   <dependency>
     <groupId>org.codehaus.mojo</groupId>
     <artifactId>exec-maven-plugin</artifactId>
     <version>3.5.0</version>
   </dependency>
   ```
   ```xml
   <!--plugin-->
   
   <!-- Compilation du front React -->
   <plugin>
     <groupId>org.codehaus.mojo</groupId>
     <artifactId>exec-maven-plugin</artifactId>
     <executions>
       <execution>
         <id>react-build</id>
         <phase>generate-resources</phase>
         <goals>
           <goal>exec</goal>
         </goals>
       </execution>
     </executions>
     <configuration>
       <workingDirectory>${project.basedir}/novanet-react</workingDirectory>
       <executable>npm</executable>
       <arguments>
         <argument>run</argument>
         <argument>build</argument>
       </arguments>
     </configuration>
   </plugin>
   ```
10. Try and compile with the `mvn compile` goal (the compiled React project should be present in `novanet/react`)
11. Create a `.gitignore` at the root of the project, of add the following to the `svn:ignore` properties
   ```ignore
   .idea/
   novanet-react/node_modules/
   novanet/react/
   target/
   ```

> Make extra sure that your IDE is compiling using the maven goals
> (e.g. in IntelliJ, go in `Settings > Build, Execution, Deployment > Build Tools > Maven > Runners` and check
`Delegate IDE build/run actions to Maven`)
