using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Modelos
{
    public class MediaPropiedadesModel : BaseModel
    {
        public string MediaId { get; set; }
        public MediaModel Media { get; set; }
        public long Size { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
    }
}
