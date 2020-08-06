using System;
using FluentMigrator;

namespace Modelos
{
    public class MigracionTest : Migration
    {
        public override void Up()
        {
            Create.Table("Hilo")
                .WithColumn("Id").AsString().Identity()
                .WithColumn("Creacion").AsDateTimeOffset();
        }
        
        public override void Down()
        {
            Delete.Table("Hilo");
        }

    }
}
