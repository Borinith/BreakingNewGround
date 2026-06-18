using BreakingNewGround.Server.DAL.AzureSQL.Data;
using BreakingNewGround.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace BreakingNewGround.Server.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MedicineController : GenericCrudController<Medicine>
    {
        public MedicineController(IGenericCrudService<Medicine> genericCrudService, ILogger<GenericCrudController<Medicine>> logger)
            : base(genericCrudService, logger)
        {
        }
    }
}